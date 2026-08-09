"use client";
import { use } from "react";
import { LiveClassRoom } from "@/components/live-class-room";
export default function Page({ params }: { params: Promise<{ classId: string }> }) { const { classId } = use(params); return <LiveClassRoom classId={classId} backHref="/student/courses" />; }
