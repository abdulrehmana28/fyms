import mongoose from "mongoose";
import { config } from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "./models/user.models.js";
import { Project } from "./models/project.models.js";
import { Deadline } from "./models/deadline.models.js";
import { Notification } from "./models/notification.models.js";
import { SupervisorRequest } from "./models/supervisorRequest.models.js";
import { UserRoleEnums } from "./utils/constants.js";

config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Project.deleteMany({});
    await Deadline.deleteMany({});
    await Notification.deleteMany({});
    await SupervisorRequest.deleteMany({});

    console.log("Creating Users...");

    // Create Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "12345678", // Will be hashed by pre-save hook
      role: UserRoleEnums.ADMIN,
    });

    // Create Teachers
    const teacher1 = await User.create({
      name: "Dr. Ali Aslam",
      email: "ali@example.com",
      password: "12345678",
      role: UserRoleEnums.TEACHER,
      department: "Paleontology",
      expertise: ["Dinosaurs", "Genetics"],
      maxStudents: 3,
    });

    const teacher2 = await User.create({
      name: "Dr. Nadeem Saeed",
      email: "nadeem@example.com",
      password: "12345678",
      role: UserRoleEnums.TEACHER,
      department: "Paleobotany",
      expertise: ["Plants", "Ecology"],
      maxStudents: 2,
    });

    // Create Students
    const student1 = await User.create({
      name: "ahmed Ali",
      email: "ahmed@example.com",
      password: "12345678",
      role: UserRoleEnums.STUDENT,
      department: "Computer Science",
    });

    const student2 = await User.create({
      name: "Ali Ameen",
      email: "aliameen@example.com",
      password: "12345678",
      role: UserRoleEnums.STUDENT,
      department: "Computer Science",
    });

    const student3 = await User.create({
      name: "Ian Malcolm",
      email: "ian@example.com",
      password: "password123",
      role: UserRoleEnums.STUDENT,
      department: "Chaos Theory",
    });

    console.log("Creating Projects...");

    // Project for Student 1 (Approved, with Supervisor)
    const project1 = await Project.create({
      student: student1._id,
      supervisor: teacher1._id,
      title: "Automated Dino Feeding System",
      description: "A system to automate the feeding of dinosaurs in the park.",
      status: "Approved",
      feedback: [
        {
          supervisorId: teacher1._id,
          type: "Approval",
          title: "Great Idea",
          message: "This is a necessary project. Approved.",
        },
      ],
    });

    // Update Student 1 and Teacher 1 with project association
    student1.project = project1._id;
    student1.supervisor = teacher1._id;
    await student1.save();

    teacher1.assignedStudents.push(student1._id);
    await teacher1.save();

    // Project for Student 2 (Pending)
    const project2 = await Project.create({
      student: student2._id,
      title: "Unix System Interface",
      description: "A 3D file system navigator.",
      status: "Pending",
    });

    student2.project = project2._id;
    await student2.save();

    console.log("Creating Deadlines...");

    const deadline1 = await Deadline.create({
      name: "Project Proposal Submission",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: admin._id,
    });

    console.log("Creating Supervisor Requests...");

    // Request from Student 3 to Teacher 2
    await SupervisorRequest.create({
      student: student3._id,
      supervisor: teacher2._id,
      message: "I would like to study the chaotic nature of plant growth.",
      status: "Pending",
    });

    console.log("Creating Notifications...");

    await Notification.create({
      user: student1._id,
      message: "Your project proposal has been approved.",
      type: "Success",
      priority: "High",
    });

    await Notification.create({
      user: teacher2._id,
      message: "You have a new supervisor request from Ian Malcolm.",
      type: "Request",
      priority: "Medium",
    });

    console.log("Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
