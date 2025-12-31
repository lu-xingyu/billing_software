import axios from "axios";

export const addCategory = async (category) => {
    return await axios.post('https://localhost:8080/api/api/v1.0/categories', category);
}

export const deleteCategory = async(categoryId) => {
    return await axios.delete(`https://localhost:8080/api/api/v1.0/categories/${categoryId}`);
}

export const fetchCategory = async () => {
    return await axios.get('https://localhost:8080/api/api/v1.0/categories');
}