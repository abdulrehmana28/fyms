import { SupervisorRequest } from "../models/supervisorRequest.models.js";

const createRequest = async (requestData) => {
  const existingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "Pending",
  });

  if (existingRequest) {
    throw new Error(
      "A pending request already exists between this student and supervisor. please wait for it to be processed.",
    );
  }

  const newRequest = await SupervisorRequest.create(requestData);

  return newRequest;
};

const getAllRequests = async (filters = {}) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);

  return { requests, total };
};

// Accepts a supervision request, assigns the supervisor to the student, and
// updates the student's latest project. Returns both the updated request and
// the modified project (if any) so callers can react accordingly.
const acceptRequestById = async (requestId, supervisorId) => {
  // locate the pending request first (we'll mutate it later)
  const request = await SupervisorRequest.findOne({
    _id: requestId,
    supervisor: supervisorId,
    status: "Pending",
  });

  if (!request) {
    throw new Error(
      "Request not found, you are not authorized, or it has already been processed",
    );
  }

  const studentId = request.student;

  // assign supervisor on user record; may throw if capacity exhausted or
  // invalid IDs
  const userService = await import("./user.services.js");
  const projectService = await import("./project.services.js");
  await userService.assignSupervisorDirectly(studentId, supervisorId);

  // update latest project if exists
  let updatedProject = null;
  const project = await projectService.getProjectsByStudentId(studentId);
  if (project) {
    project.supervisor = supervisorId;
    project.status = "Approved";
    updatedProject = await project.save();
  }

  // mark approved
  request.status = "Approved";
  await request.save();

  // populate separately (avoid chaining on promise)
  await request.populate("student", "name email supervisor project");
  await request.populate(
    "supervisor",
    "name email assignedStudents maxStudents",
  );

  return { request, project: updatedProject };
};

const rejectRequestById = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email ")
    .populate("supervisor", "name email");

  if (!request) {
    throw new Error("Request not found or already processed");
  }

  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("You are not authorized to reject this request");
  }

  if (request.status !== "Pending") {
    throw new Error("Request has already been processed");
  }

  request.status = "Rejected";
  await request.save();

  return request;
};

export { createRequest, getAllRequests, acceptRequestById, rejectRequestById };
