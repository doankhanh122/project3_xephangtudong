import useSWR from "swr";

const fetcher = (url: string) => {
  return fetch(url).then((res) => res.json());
};

export const useQueueHasCustomers = (id: string) => {
  const { data, error } = useSWR(`/api/getqueuehascustomers/${id}`, fetcher);

  return {
    queueHasCustomers: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useGetQueues = () => {
  const { data, error } = useSWR(`/api/getqueue`, fetcher);

  return {
    queues: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useGetQueue = (id: string) => {
  const { data, error } = useSWR(`/api/getqueue/${id}`, fetcher, {
    refreshInterval: 0,
  });

  return {
    queue: data,
    isLoading: !error && !data,
    isError: error,
  };
};
