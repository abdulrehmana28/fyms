import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";

const createUser = async (userData) => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

const updateUser = async (id, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

const getUserById = async (id) => {
  try {
    const user = await User.findById(id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );
    return user;
  } catch (error) {
    throw new Error(`Error retrieving user: ${error.message}`);
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return await user.deleteOne();
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

const getAllUsers = async () => {
  try {
    const query = { role: { $ne: "Admin" } };

    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 });

    return users;
  } catch (error) {
    throw new Error(`Error retrieving users: ${error.message}`);
  }
};

/**
 * Legacy helper kept for backwards-compatibility.
 * Assigns a supervisor to a single student — used by the old 1:1 flow.
 * Prefer assignSupervisorToProject for group-aware assignment.
 */
const assignSupervisorDirectly = async (studentId, supervisorId) => {
  const student = await User.findOne({ _id: studentId, role: "Student" });
  const supervisor = await User.findOne({
    _id: supervisorId,
    role: "Supervisor",
  });

  if (!student || !supervisor) {
    throw new Error("Invalid student or supervisor ID");
  }

  if (!supervisor.hasCapacity()) {
    throw new Error("Supervisor has reached maximum student capacity");
  }

  student.supervisor = supervisor._id;
  supervisor.assignedStudents.push(student._id);
  await Promise.all([student.save(), supervisor.save()]);

  return { student, supervisor };
};

/**
 * Group-aware supervisor assignment.
 * Sets the supervisor on the Project, on every member User, and pushes only
 * the project's createdBy to Supervisor.assignedStudents (for capacity
 * counting — 1 group = 1 slot).
 */
const assignSupervisorToProject = async (projectId, supervisorId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const supervisor = await User.findOne({
    _id: supervisorId,
    role: "Supervisor",
  });
  if (!supervisor) throw new Error("Supervisor not found");

  if (!supervisor.hasCapacity()) {
    throw new Error("Supervisor has reached maximum student capacity");
  }

  // Set supervisor on project
  project.supervisor = supervisorId;
  project.status = "Approved";
  await project.save();

  // Set supervisor on every group member
  await User.updateMany(
    { _id: { $in: project.members } },
    { $set: { supervisor: supervisorId } },
  );

  // For capacity counting, push only the project leader (createdBy)
  if (
    !supervisor.assignedStudents.some(
      (id) => id.toString() === project.createdBy.toString(),
    )
  ) {
    supervisor.assignedStudents.push(project.createdBy);
    await supervisor.save();
  }

  return { project, supervisor };
};

export {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  getAllUsers,
  assignSupervisorDirectly,
  assignSupervisorToProject,
};
