export type LoginResponse = {
  message: string;
  user: {
    id: string;
    username: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
    type: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  };
};
