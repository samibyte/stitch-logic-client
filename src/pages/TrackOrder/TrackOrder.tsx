import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useAxiosSecure from "@/hooks/useAxiosSecure";

interface StepDetails {
  location: string;
  note?: string;
  updatedAt: string;
  status: string;
}

interface TimelineStep {
  status: string;
  completed: boolean;
  update: {
    location: string;
    note: string;
    updatedAt: string;
  } | null;
}

interface TrackingResponse {
  trackingId: string;
  status: string;
  buyer: { name: string; email: string };
  timeline: TimelineStep[];
  lastUpdate: StepDetails | null;
}

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  // Using the /tracking endpoint which returns your formatted 'timeline' array
  const { data, isLoading, isError } = useQuery<TrackingResponse>({
    queryKey: ["order-tracking", orderId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders/${orderId}/tracking`);
      return res.data;
    },
    enabled: !!orderId,
  });

  if (isLoading)
    return (
      <div className="space-y-4 p-10">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  if (isError || !data)
    return <div className="p-10 text-center">Tracking data unavailable.</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-2 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Journey</h1>
          <p className="text-muted-foreground text-lg">
            Tracking ID:{" "}
            <span className="text-primary font-mono">{data.trackingId}</span>
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-primary/5 border-primary/20 text-primary px-4 py-1 text-lg capitalize"
        >
          {data.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Timeline (Chronological based on your Backend 'timeline' array) */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="lg:bg-card border-none bg-transparent shadow-none lg:border lg:shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="text-primary h-5 w-5" /> Progress Details
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {/* The Timeline UI */}
              <div className="bg-muted absolute top-10 bottom-10 left-[27px] w-0.5" />

              <div className="space-y-8">
                {data.timeline.map((step) => {
                  const isLatest = data.lastUpdate?.status === step.status;

                  return (
                    <div
                      key={step.status}
                      className="relative flex items-start gap-6"
                    >
                      {/* Icon Indicator */}
                      <div
                        className={`relative z-10 mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${step.completed ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"}`}
                      >
                        {step.completed && (
                          <CheckCircle2 className="text-primary-foreground h-4 w-4" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`flex-1 rounded-xl border p-5 transition-all ${step.completed ? "bg-card border-muted shadow-sm" : "bg-muted/20 border-transparent opacity-60"} ${isLatest ? "ring-primary border-primary bg-primary/[0.02] ring-2" : ""}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3
                            className={`font-bold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {step.status}
                          </h3>
                          {isLatest && (
                            <Badge className="bg-primary hover:bg-primary">
                              Current Location
                            </Badge>
                          )}
                        </div>

                        {step.completed ? (
                          <div className="space-y-3">
                            {step.update ? (
                              // CASE A: We have real data for this step
                              <>
                                <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />{" "}
                                    {step.update.location}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(
                                      step.update.updatedAt,
                                    ).toLocaleString([], {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                                  </span>
                                </div>
                                {step.update.note && (
                                  <div className="bg-muted/50 border-primary/30 rounded-lg border-l-4 p-3 text-sm italic">
                                    "{step.update.note}"
                                  </div>
                                )}
                              </>
                            ) : (
                              // CASE B: Implicitly completed (System estimate)
                              <div className="text-muted-foreground flex items-center gap-2 text-sm italic">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed (system estimate)
                              </div>
                            )}
                          </div>
                        ) : (
                          // CASE C: Future step
                          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Upcoming Step
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-bold uppercase">
                  Customer
                </p>
                <p className="text-base font-medium">{data.buyer.name}</p>
                <p className="text-muted-foreground">{data.buyer.email}</p>
              </div>
              <div className="border-t pt-4">
                <div className="bg-muted text-muted-foreground flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <MapIcon className="mb-2 h-6 w-6 opacity-30" />
                  <p className="text-[10px] tracking-tighter uppercase">
                    Live Map View <br />
                    coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
