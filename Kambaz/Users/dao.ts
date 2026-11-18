import { v4 as uuidv4 } from "uuid";

export default function UsersDao(db) {
    const createUser = (user) => {
        const newUser = { ...user, _id: uuidv4() };
        db.users = [...db.users, newUser];
        return newUser;
    };
    const findUserById = (userId) =>
        db.users.find((user) => user._id === userId);
    const findUserByUsername = (username) =>
        db.users.find((user) => user.username === username);
    const findUserByCredentials = (username, password) =>
        db.users.find((user) => user.username === username && user.password === password);
    const updateUser = (userId, updates) => {
        db.users = db.users.map((u) =>
            u._id === userId ? { ...u, ...updates, _id: userId } : u,
        );
    };
    const deleteUser = (userId) => {
        db.users = db.users.filter((u) => u._id !== userId);
        db.enrollments = db.enrollments.filter((e) => e.user !== userId);
    };
    const findUsersForCourse = (courseId) => {
        const userIds = db.enrollments
            .filter((e) => e.course === courseId)
            .map((e) => e.user);
        return db.users.filter((u) => userIds.includes(u._id));
    };
    return {
        createUser,
        findUserById,
        findUserByUsername,
        findUserByCredentials,
        updateUser,
        deleteUser,
        findUsersForCourse,
    };
}