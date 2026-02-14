import { create } from "zustand";

export const useAuthStore = create ((set, get) => ({
    authUser: {
        name: "john",
        _id: 123,
        age: 23,
    },
    login: () => {
        console.log("we just logged in ");
    },
}))