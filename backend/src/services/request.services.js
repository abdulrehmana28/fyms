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

// Accepts a supervision request, assigns the supervisor to the student's
// project/group, and updates ALL group members. Returns both the updated
// request and the modified project (if any).
const acceptRequestById = async (requestId, supervisorId) => {
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

  // Use the group-aware helper that assigns supervisor to the entire project
  const userService = await import("./user.services.js");
  const projectService = await import("./project.services.js");

  // Find the student's project first
  const project = await projectService.getProjectsByStudentId(studentId);

  if (project) {
    // Assign supervisor to entire project/group
    await userService.assignSupervisorToProject(project._id, supervisorId);

    // Reload project to get updated state
    var updatedProject = await projectService.getProjectById(project._id);
  }

  // mark approved
  request.status = "Approved";
  await request.save();

  // populate separately
  await request.populate("student", "name email supervisor project");
  await request.populate(
    "supervisor",
    "name email assignedStudents maxStudents",
  );

  return { request, project: updatedProject || null };
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

  // Find the student's project and mark it as Rejected so they can resubmit
  const projectService = await import("./project.services.js");
  const project = await projectService.getProjectsByStudentId(request.student);
  if (project) {
    project.status = "Rejected";
    await project.save();
  }

  return request;
};

export { createRequest, getAllRequests, acceptRequestById, rejectRequestById };
