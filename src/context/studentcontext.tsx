import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Student {
  id: string;
  name: string;
  // Add other fields as needed
}

interface StudentContextType {
  students: Student[];
  addStudent: (student: Student) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error("useStudentContext must be used within StudentProvider");
  return context;
};

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);

  const addStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
  };

  return (
    <StudentContext.Provider value={{ students, addStudent }}>
      {children}
    </StudentContext.Provider>
  );
};