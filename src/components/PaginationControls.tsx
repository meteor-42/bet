import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  pageNumbers: (number | string)[];
  canGoToNext: boolean;
  canGoToPrevious: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  pageNumbers,
  canGoToNext,
  canGoToPrevious,
  onPageChange,
  onNextPage,
  onPreviousPage,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        Показано {startItem}-{endItem} из {totalItems} элементов
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={canGoToPrevious ? onPreviousPage : undefined}
              className={!canGoToPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageNumbers.map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(pageNumber as number)}
                  isActive={pageNumber === currentPage}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={canGoToNext ? onNextPage : undefined}
              className={!canGoToNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
