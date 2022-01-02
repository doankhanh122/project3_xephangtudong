import useSWR from "swr";

const fetcher = (url: string) => {
    return fetch(url).then(res => res.json())
}

export const useQueueHasCustomers = (id: string) => {
    const {data, error } = useSWR(`/api/getqueuehascustomers/${id}`, fetcher)

    return {
        data,
        isLoading: !error && !data,
        error
    }
}

// export const useGetQueues = () => {
//     const {data, error } = useSWR(`/api/getqueue`, fetcher)

//     return {
//         queues: data,
//         isLoading: !error && !data,
//         isError: error
//     }
// }



