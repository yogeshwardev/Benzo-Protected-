"use client";

import { useEffect, useState } from "react";
import {
  Chat,
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useParticipants,
  useTracks
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { ArrowLeft, Video } from "lucide-react";
import { ErrorState, PageHeading } from "@/components/student-ui";
import { apiRequest } from "@/lib/api";

type JoinResponse = { token: string; url?: string; room: string };

export function LiveClassRoom({ classId, backHref }: { classId: string; backHref: string }) {
  const [connection, setConnection] = useState<JoinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true); setError(null);
    try {
      const token = await apiRequest<JoinResponse>(`/live-classes/${classId}/token`, { method: "POST" });
      setConnection(token);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to join class.");
    } finally { setBusy(false); }
  }

  function leave() {
    setConnection(null);
  }

  useEffect(() => () => setConnection(null), []);

  return (
    <>
      <a className="inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]" href={backHref}>
        <ArrowLeft size={16} /> Back to classes
      </a>
      <div className="mt-6">
        <PageHeading
          eyebrow="Live learning"
          title="Live classroom"
          description="BENZO verifies course access and the class join window before issuing a room token."
        />
      </div>
      {error ? <ErrorState message={error} /> : null}
      <section className="mt-5 overflow-hidden border border-[var(--line)] bg-[#111817] text-white">
        {connection?.url ? (
          <LiveKitRoom
            className="min-h-[72vh]"
            token={connection.token}
            serverUrl={connection.url}
            connect
            audio={false}
            video={false}
            onDisconnected={leave}
            onError={(caught) => setError(caught.message)}
          >
            <ClassroomSurface roomName={connection.room} />
          </LiveKitRoom>
        ) : (
          <div className="grid aspect-video max-h-[62vh] place-items-center bg-black/35 p-6 text-center">
            <div>
              <Video className="mx-auto text-white/40" size={42} />
              <h2 className="mt-4 text-xl font-black">Ready to join?</h2>
              <button
                className="mt-5 h-11 bg-[var(--brand)] px-6 text-sm font-black disabled:opacity-50"
                disabled={busy}
                onClick={() => void join()}
              >
                {busy ? "Checking access..." : "Join classroom"}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function ClassroomSurface({ roomName }: { roomName: string }) {
  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="grid min-h-[72vh] grid-rows-[auto_1fr_auto] bg-[#111817] text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase text-white/45">Room</p>
          <p className="text-sm font-black text-white/80">{roomName}</p>
        </div>
        <p className="text-sm font-bold text-white/65">{participants.length} participant(s)</p>
      </div>
      <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="min-h-0 bg-black/35 p-3">
          <GridLayout className="h-full content-center" tracks={tracks}>
            <ParticipantTile />
          </GridLayout>
        </div>
        <aside className="min-h-80 border-t border-white/10 bg-[#151f1d] lg:border-l lg:border-t-0">
          <Chat className="h-full" />
        </aside>
      </div>
      <div className="border-t border-white/10 bg-[#0f1715] px-3 py-2">
        <RoomAudioRenderer />
        <ControlBar
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            chat: true,
            leave: true,
            settings: true
          }}
        />
      </div>
    </div>
  );
}
