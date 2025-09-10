import axios from 'axios'

const BASE = process.env.OPENF1_BASE ?? "https://api.openf1.org/v1";

export const paths = {
    car_data: "/car_data",
    drivers: "/drivers",
    laps: "/laps",
    meetings: "/meetings",
    position: "/position",
    sessions: "/sessions",
    session_result: "/session_result",
    starting_grid: "/starting_grid",
    stints: "/stints",
    weather: "/weather",
}

export const api = axios.create({
    baseURL: BASE,
    headers: { accept: "application/json" },
    timeout: 10000,
});

export async function openf1Get(path, params = {}) {
    try {
        const { data } = await api.get(path, { params });

        return data;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const status = e.response?.status ?? 0;
            const detail = e.response?.data ?? err.message;
            throw new Error(
                `OpenF1 GET ${path} failed (${status}): ${
                    typeof detail === "string" ? detail: JSON.stringify(detail).slice(0, 400)
                }`
            );
        }

        throw e;
    }
}
