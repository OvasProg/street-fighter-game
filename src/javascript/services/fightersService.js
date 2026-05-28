import callApi from '../helpers/apiHelper';

class FighterService {
    #endpoint = 'fighters.json';

    #detailsCache = new Map();

    async getFighters() {
        try {
            const apiResult = await callApi(this.#endpoint);
            return apiResult;
        } catch (error) {
            throw error;
        }
    }

    async getFighterDetails(id) {
        try {
            if (this.#detailsCache.has(id)) {
                return this.#detailsCache.get(id);
            }

            const endpoint = `details/fighter/${id}.json`;
            const apiResult = await callApi(endpoint);

            this.#detailsCache.set(id, apiResult);

            return apiResult;
        } catch (error) {
            throw error;
        }
    }
}

const fighterService = new FighterService();

export default fighterService;
