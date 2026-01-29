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
  return await newRequest.save();
};

const getAllRequests = async (filters = {}) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);

  return { requests, total };
};

const acceptRequestById = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assignedStudents maxStudents");

  if (!request) {
    throw new Error("Request not found or already processed");
  }

  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("You are not authorized to accept this request");
  }

  if (request.status !== "Pending") {
    throw new Error("Request has already been processed");
  }

  request.status = "Accepted";
  await request.save();

  return request;
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
