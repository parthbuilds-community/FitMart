import { getBugs, patchBugStatus } from "../utils/api/bugs";
const API_URL = import.meta.env.VITE_API_URL;

export const getBugs = async (token) => {
  const data = await getBugs(token);

  if (!response.ok) {
    throw new Error("Failed to fetch bugs");
  }

  return response.json();
};

export const patchBugStatus = async (id, status, token) => {
  const response = await 
 await patchBugStatus(id, status, token);

  if (!response.ok) {
    throw new Error("Failed to update status");
  }

  return response.json();
};