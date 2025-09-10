import axios from 'axios'

const BASE = process.env.FF1_BASE ?? "https://api.openf1.org/v1";

export const paths = {
    quali_chart: '/quali_h2h/chart',
}

export const api = axios.create({
    baseURL: BASE,
    headers: { accept: "application/json" },
    timeout: 2000000,
});

export async function fastF1Get(path, params = {}) {
    try {
        const { data } = await api.get(path, { 
            params,
            paramsSerializer: params => {
                const query = [];
                for (const key in params) {
                    const value = params[key];
                    if (Array.isArray(value)) {
                        value.forEach(v => query.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
                    } else if (value !== undefined && value !== null) {
                        query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                    }
                }
                    
                return query.join('&');
            }
         });

        return data;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const status = e.response?.status ?? 0;
            const detail = e.response?.data ?? e.message;
            throw new Error(
                `FastF1 GET ${path} failed (${status}): ${
                    typeof detail === "string" ? detail: JSON.stringify(detail).slice(0, 400)
                }`
            );
        }

        throw e;
    }
}
