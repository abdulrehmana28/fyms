import { User } from "../models/user.models.js";

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

    //   console.log(users);

    return users;
  } catch (error) {
    throw new Error(`Error retrieving users: ${error.message}`);
  }
};

const assignSupervisorDirectly = async (studentId, supervisorId) => {
  const student = await User.findOne({ _id: studentId, role: "Student" });
  const supervisor = await User.findOne({ _id: supervisorId, role: "Teacher" });

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

export {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  getAllUsers,
  assignSupervisorDirectly,
};
