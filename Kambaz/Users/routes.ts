import UsersDao from "./dao";
import EnrollmentsDao from "../Enrollments/dao";

export default function UserRoutes(app, db) {
    const dao = UsersDao(db);
    const enrollmentsDao = EnrollmentsDao(db);

    const withoutPassword = ({ password, ...rest }) => rest;

    const requireFaculty = (req, res) => {
        const currentUser = req.session["currentUser"];
        if (!currentUser || currentUser.role !== "FACULTY") {
            res.sendStatus(403);
            return false;
        }
        return true;
    };

    const signup = (req, res) => {
        const user = dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json({ message: "Username already in use" });
            return;
        }
        const currentUser = dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };

    const signin = (req, res) => {
        const { username, password } = req.body;
        const currentUser = dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.status(401).json({ message: "Unable to login. Try again later." });
        }
    };

    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };

    const profile = (req, res) => {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        res.json(currentUser);
    };

    const updateUser = (req, res) => {
        const { userId } = req.params;
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        if (currentUser._id !== userId && currentUser.role !== "FACULTY") {
            res.sendStatus(403);
            return;
        }
        dao.updateUser(userId, req.body);
        const updatedUser = dao.findUserById(userId);
        if (currentUser._id === userId) {
            req.session["currentUser"] = updatedUser;
        }
        res.json(updatedUser);
    };

    const findUsersForCourse = (req, res) => {
        const users = dao.findUsersForCourse(req.params.courseId);
        res.json(users.map(withoutPassword));
    };

    const createUserForCourse = (req, res) => {
        if (!requireFaculty(req, res)) return;
        if (dao.findUserByUsername(req.body.username)) {
            res.status(400).json({ message: "Username already in use" });
            return;
        }
        const newUser = dao.createUser(req.body);
        enrollmentsDao.enrollUserInCourse(newUser._id, req.params.courseId);
        res.json(withoutPassword(newUser));
    };

    const deleteUser = (req, res) => {
        if (!requireFaculty(req, res)) return;
        dao.deleteUser(req.params.userId);
        res.sendStatus(200);
    };

    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.get("/api/users/profile", profile);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.get("/api/courses/:courseId/users", findUsersForCourse);
    app.post("/api/courses/:courseId/users", createUserForCourse);
}