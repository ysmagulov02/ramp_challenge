import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    if (loading) return

    try {
      const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
        "paginatedTransactions",
        {
          page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
        }
      )

      setPaginatedTransactions((previousResponse) => {
        if (!response) return previousResponse

        const previousData = previousResponse?.data || []
        return {
          data: [...previousData, ...response.data], // Merging data to handle Bug #4
          nextPage: response.nextPage,
        }
      })
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }, [fetchWithCache, loading, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
