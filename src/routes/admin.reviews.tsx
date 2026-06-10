import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Star, Check, X, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  listAllReviews,
  moderateReview,
  deleteReview,
  type AdminReview,
} from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

type Filter = "pending" | "approved" | "rejected";

function AdminReviews() {
  const fetchAll = useServerFn(listAllReviews);
  const moderate = useServerFn(moderateReview);
  const remove = useServerFn(deleteReview);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Filter>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => fetchAll() as Promise<AdminReview[]>,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    qc.invalidateQueries({ queryKey: ["approved-reviews"] });
  };

  const moderateMut = useMutation({
    mutationFn: (v: { id: string; status: Filter }) => moderate({ data: v }),
    onSuccess: () => {
      toast.success("Review updated");
      invalidate();
    },
    onError: (e) => toast.error("Could not update", { description: (e as Error).message }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Review deleted");
      invalidate();
    },
    onError: (e) => toast.error("Could not delete", { description: (e as Error).message }),
  });

  const reviews = (data ?? []).filter((r) => r.status === tab);
  const counts = {
    pending: (data ?? []).filter((r) => r.status === "pending").length,
    approved: (data ?? []).filter((r) => r.status === "approved").length,
    rejected: (data ?? []).filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold">Client Reviews</h2>
        <p className="text-sm text-muted-foreground">
          Approve member-submitted reviews before they appear on the homepage.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Filter)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No {tab} reviews.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviews.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3">
                      {r.avatar_url ? (
                        <img
                          src={r.avatar_url}
                          alt={r.reviewer_name}
                          loading="lazy"
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                          {r.reviewer_name.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{r.reviewer_name}</span>
                          {r.reviewer_role && (
                            <span className="text-xs text-muted-foreground">{r.reviewer_role}</span>
                          )}
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="mt-1 flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i < r.rating ? "fill-warning text-warning" : "text-muted-foreground/30",
                              )}
                            />
                          ))}
                        </div>
                        {r.review_title && (
                          <p className="mt-2 text-sm font-semibold text-foreground">{r.review_title}</p>
                        )}
                        <p className="mt-1 text-sm text-foreground">{r.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {r.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => moderateMut.mutate({ id: r.id, status: "approved" })}
                          disabled={moderateMut.isPending}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      )}
                      {r.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateMut.mutate({ id: r.id, status: "rejected" })}
                          disabled={moderateMut.isPending}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      )}
                      {r.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moderateMut.mutate({ id: r.id, status: "pending" })}
                          disabled={moderateMut.isPending}
                        >
                          <RotateCcw className="h-4 w-4" /> Move to pending
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this review?")) delMut.mutate(r.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
