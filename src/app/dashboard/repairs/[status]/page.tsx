"use client";

import { Button } from "@/components/ui/button";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { ViewRepairDialog } from "./_components/view-repair-dialog";
import { useSession } from "@clerk/clerk-react";
import { useEffect } from "react";

const orders = ["new", "inProgress", "readyForPickup", "completed"] as const;
type OrderTypes = (typeof orders)[number];

export default function DashboardPage({
  params,
}: {
  params: { status: string };
}) {
  if (
    !["new", "inProgress", "readyForPickup", "completed"].includes(
      params.status
    )
  ) {
    return redirect("/dashboard/repairs/new");
  }

  const session = useSession();

  useEffect(() => {
    if (session.isLoaded && (session.session?.publicUserData as any).isAdmin) {
      return redirect("/");
    }
  }, [session]);

  const status = params.status as OrderTypes;

  const setStatusMutation = useMutation(api.repairs.setRepairStatus);
  const repairs = useQuery(api.repairs.getRepairs, {
    status,
  });

  const titlesByStatus: Record<OrderTypes, string> = {
    new: "New",
    completed: "Completed",
    inProgress: "In Progress",
    readyForPickup: "Ready for Pickup",
  };

  const title = titlesByStatus[status];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-snug text-gray-500 dark:text-gray-400">
          {!repairs || repairs.length === 0 ? (
            <div>No Repairs</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repair ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs?.map((repair) => {
                  return (
                    <TableRow key={repair._id}>
                      <TableCell>
                        <ViewRepairDialog repair={repair} />
                      </TableCell>
                      <TableCell>{repair.user.name}</TableCell>
                      <TableCell>{repair.user.email}</TableCell>
                      <TableCell>
                        {DateTime.fromMillis(repair._creationTime).toFormat(
                          "LLL dd, yyyy hh:MM a"
                        )}
                      </TableCell>
                      <TableCell>
                        {status === "new" && (
                          <Button
                            onClick={() => {
                              setStatusMutation({
                                repairId: repair._id,
                                status: "inProgress",
                              });
                            }}
                          >
                            Move to In Progress
                          </Button>
                        )}
                        {status === "inProgress" && (
                          <Button
                            onClick={() => {
                              setStatusMutation({
                                repairId: repair._id,
                                status: "readyForPickup",
                              });
                            }}
                          >
                            Set Ready for Pickup
                          </Button>
                        )}
                        {status === "readyForPickup" && (
                          <Button
                            onClick={() => {
                              setStatusMutation({
                                repairId: repair._id,
                                status: "completed",
                              });
                            }}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
