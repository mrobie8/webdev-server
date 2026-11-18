import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {
    function findEnrollmentsForUser(userId) {
        return db.enrollments.filter((e) => e.user === userId);
    }
    function enrollUserInCourse(userId, courseId) {
        const existing = db.enrollments.find(
            (e) => e.user === userId && e.course === courseId,
        );
        if (existing) return existing;
        const enrollment = { _id: uuidv4(), user: userId, course: courseId };
        db.enrollments = [...db.enrollments, enrollment];
        return enrollment;
    }
    function unenrollUserFromCourse(userId, courseId) {
        db.enrollments = db.enrollments.filter(
            (e) => !(e.user === userId && e.course === courseId),
        );
    }
    return { findEnrollmentsForUser, enrollUserInCourse, unenrollUserFromCourse };
}