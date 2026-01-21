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

export { createRequest };
