import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, Radio, Users, Wifi, WifiOff } from "lucide-react";
import { getThemeById } from "@/lib/themes";
import { usePublicPresentation } from "@/hooks/usePublicPresentation";
import { PublicSlideViewer } from "@/components/public";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Live Presentation Mode
 * Route: /live/:token
 * 
 * Features:
 * - Real-time sync: Audience sees slides change as presenter navigates
 * - Presenter controls navigation, audience follows
 * - Uses Supabase Realtime for instant updates
 */

interface LiveState {
  currentSlide: number;
  isLive: boolean;
  presenterName?: string;
}

const LivePresentation = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const isPresenter = searchParams.get('presenter') === 'true';
  
  const { presentationInfo, slides, isLoading, error } = usePublicPresentation(token);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const theme = presentationInfo ? getThemeById(presentationInfo.theme_id) : getThemeById('modern-blue');

  // Setup realtime channel
  useEffect(() => {
    if (!token || !presentationInfo) return;

    const channelName = `live-presentation:${token}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: isPresenter ? 'presenter' : `viewer-${Math.random().toString(36).substr(2, 9)}` },
      },
    });

    channel
      .on('broadcast', { event: 'slide-change' }, ({ payload }) => {
        if (!isPresenter) {
          setCurrentIndex(payload.slideIndex);
        }
      })
      .on('broadcast', { event: 'live-status' }, ({ payload }) => {
        setIsLive(payload.isLive);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).filter(k => k.startsWith('viewer-')).length;
        setViewerCount(count);
        setIsConnected(true);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            online_at: new Date().toISOString(),
            isPresenter,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [token, presentationInfo, isPresenter]);

  // Presenter: Broadcast slide changes
  const handleSlideChange = useCallback((index: number) => {
    setCurrentIndex(index);
    if (isPresenter && channelRef.current && isLive) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'slide-change',
        payload: { slideIndex: index },
      });
    }
  }, [isPresenter, isLive]);

  // Presenter: Toggle live mode
  const toggleLive = useCallback(() => {
    const newLiveState = !isLive;
    setIsLive(newLiveState);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'live-status',
        payload: { isLive: newLiveState },
      });
      // Also broadcast current slide when going live
      if (newLiveState) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'slide-change',
          payload: { slideIndex: currentIndex },
        });
      }
    }
  }, [isLive, currentIndex]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Helmet>
          <title>Joining Live Presentation... | SlideForge</title>
        </Helmet>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Connecting to live presentation...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !presentationInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Helmet>
          <title>Live Session Not Found | SlideForge</title>
        </Helmet>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Live Session Not Found</h1>
          <p className="text-slate-400">
            {error || 'This live presentation link is invalid or has ended.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Helmet>
        <title>{isPresenter ? 'Presenting' : 'Live'}: {presentationInfo.title} | SlideForge</title>
      </Helmet>

      {/* Live Header */}
      <header className="h-12 px-4 flex items-center justify-between bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
            isLive 
              ? "bg-red-500/20 text-red-400" 
              : "bg-slate-800 text-slate-400"
          )}>
            <Radio className={cn("h-4 w-4", isLive && "animate-pulse")} />
            {isLive ? 'LIVE' : 'Not Live'}
          </div>

          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-1.5 text-sm",
            isConnected ? "text-emerald-400" : "text-slate-500"
          )}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Viewer Count */}
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            {viewerCount} viewer{viewerCount !== 1 && 's'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Title */}
          <span className="text-sm text-white font-medium truncate max-w-[200px]">
            {presentationInfo.title}
          </span>

          {/* Presenter Controls */}
          {isPresenter && (
            <button
              onClick={toggleLive}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isLive
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              )}
            >
              {isLive ? 'End Live' : 'Go Live'}
            </button>
          )}
        </div>
      </header>

      {/* Slide Viewer */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl aspect-video">
          <PublicSlideViewer
            slides={slides}
            theme={theme}
            initialIndex={currentIndex}
            showControls={isPresenter}
            onSlideChange={handleSlideChange}
          />
        </div>
      </main>

      {/* Viewer Instructions */}
      {!isPresenter && !isLive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center max-w-md p-6 bg-slate-900 rounded-xl border border-slate-700">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Radio className="h-6 w-6 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Waiting for Presenter</h2>
            <p className="text-slate-400">
              The presenter hasn't started the live session yet. 
              Stay on this page to automatically join when they go live.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Connected and waiting...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePresentation;
