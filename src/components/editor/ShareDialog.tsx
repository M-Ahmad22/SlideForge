import { useState, useCallback, useEffect } from "react";
import {
  Share2,
  Link,
  Copy,
  Check,
  Globe,
  Lock,
  Eye,
  Edit,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
  Code,
  Radio,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ShareInfo {
  id: string;
  share_token: string;
  permission: "view" | "edit";
  is_active: boolean;
  created_at: string;
}

interface ShareDialogProps {
  presentationId: string;
  presentationTitle: string;
}

export const ShareDialog = ({
  presentationId,
  presentationTitle,
}: ShareDialogProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("share");

  // Check if running on Lovable preview (requires auth) vs published domain
  const currentOrigin = window.location.origin;
  const isPreviewMode =
    currentOrigin.includes("lovable.app") ||
    currentOrigin.includes("lovableproject.com") ||
    currentOrigin.includes("vercel.app") ||
    currentOrigin.includes("localhost");

  // Use published URL from env if available, otherwise use current origin
  // For production, this should be the custom domain
  const publishedUrl = import.meta.env.VITE_PUBLIC_URL || currentOrigin;
  const baseUrl = isPreviewMode ? publishedUrl : currentOrigin;

  // Generate different URL types
  const urls = shareInfo
    ? {
        public: `${baseUrl}/p/${shareInfo.share_token}`,
        view: `${baseUrl}/view/${shareInfo.share_token}`,
        present: `${baseUrl}/present/${shareInfo.share_token}`,
        embed: `${baseUrl}/embed/${shareInfo.share_token}`,
        live: `${baseUrl}/live/${shareInfo.share_token}`,
        livePresenter: `${baseUrl}/live/${shareInfo.share_token}?presenter=true`,
      }
    : null;

  // Generate embed code
  const embedCode = urls
    ? `<iframe src="${urls.embed}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`
    : "";

  // Fetch existing share info
  const fetchShareInfo = useCallback(async () => {
    if (!presentationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("presentation_shares")
        .select("*")
        .eq("presentation_id", presentationId)
        .single();

      if (error && error.code !== "PGRST116") {
        // Not found is OK
        throw error;
      }

      setShareInfo(data as ShareInfo | null);
    } catch (error) {
      console.error("Error fetching share info:", error);
    } finally {
      setIsLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    if (isOpen) {
      fetchShareInfo();
    }
  }, [isOpen, fetchShareInfo]);

  // Create share link
  const createShareLink = async (permission: "view" | "edit") => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("presentation_shares")
        .insert({
          presentation_id: presentationId,
          permission,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setShareInfo(data as ShareInfo);
      toast.success("Share link created!");
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  };

  // Update permission
  const updatePermission = async (permission: "view" | "edit") => {
    if (!shareInfo) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("presentation_shares")
        .update({ permission })
        .eq("id", shareInfo.id);

      if (error) throw error;

      setShareInfo({ ...shareInfo, permission });
      toast.success(`Permission updated to ${permission}`);
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle active state
  const toggleActive = async () => {
    if (!shareInfo) return;

    setIsLoading(true);
    try {
      const newActive = !shareInfo.is_active;
      const { error } = await supabase
        .from("presentation_shares")
        .update({ is_active: newActive })
        .eq("id", shareInfo.id);

      if (error) throw error;

      setShareInfo({ ...shareInfo, is_active: newActive });
      toast.success(newActive ? "Link activated" : "Link disabled");
    } catch (error) {
      console.error("Error toggling active state:", error);
      toast.error("Failed to update link status");
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate token
  const regenerateToken = async () => {
    if (!shareInfo || !user) return;

    setIsLoading(true);
    try {
      // Delete old and create new
      await supabase
        .from("presentation_shares")
        .delete()
        .eq("id", shareInfo.id);

      const { data, error } = await supabase
        .from("presentation_shares")
        .insert({
          presentation_id: presentationId,
          permission: shareInfo.permission,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setShareInfo(data as ShareInfo);
      toast.success("New link generated! Old link is now invalid.");
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to regenerate link");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete share
  const deleteShare = async () => {
    if (!shareInfo) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("presentation_shares")
        .delete()
        .eq("id", shareInfo.id);

      if (error) throw error;

      setShareInfo(null);
      toast.success("Share link removed");
    } catch (error) {
      console.error("Error deleting share:", error);
      toast.error("Failed to remove share link");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy link
  const copyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{presentationTitle}"
          </DialogTitle>
          <DialogDescription>
            Share, embed, or present live. Anyone with the link can access based
            on permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading && !shareInfo ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !shareInfo ? (
            // No share link yet
            <div className="space-y-4">
              <div className="text-center py-6 border border-dashed border-border rounded-lg">
                <Globe className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Create a shareable link for this presentation
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => createShareLink("view")}
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Only
                  </Button>
                  <Button
                    onClick={() => createShareLink("edit")}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Can Edit
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Share link exists - show tabs
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="share" className="gap-1.5">
                  <Link className="h-3.5 w-3.5" />
                  Share
                </TabsTrigger>
                <TabsTrigger value="embed" className="gap-1.5">
                  <Code className="h-3.5 w-3.5" />
                  Embed
                </TabsTrigger>
                <TabsTrigger value="live" className="gap-1.5">
                  <Radio className="h-3.5 w-3.5" />
                  Live
                </TabsTrigger>
              </TabsList>

              {/* Share Tab */}
              <TabsContent value="share" className="space-y-4 mt-4">
                {/* Link status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {shareInfo.is_active ? (
                      <Badge variant="default" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Disabled
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      {shareInfo.permission === "edit" ? (
                        <>
                          <Edit className="h-3 w-3" />
                          Can Edit
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          View Only
                        </>
                      )}
                    </Badge>
                  </div>
                  <Switch
                    checked={shareInfo.is_active}
                    onCheckedChange={toggleActive}
                    disabled={isLoading}
                  />
                </div>

                {/* Public Share URL */}
                <div className="space-y-2">
                  <Label>Public Link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={urls?.present || ""}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyLink(urls?.present || "", "Link")}
                    >
                      {copied === "Link" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(urls?.present, "_blank")}
                      disabled={isPreviewMode}
                      title={
                        isPreviewMode
                          ? "Publish app to test public links"
                          : "Open link"
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPreviewMode
                      ? "Link will work after publishing your app"
                      : "Opens as a clean, standalone presentation viewer"}
                  </p>
                </div>

                {/* Permission select */}
                <div className="space-y-2">
                  <Label>Permission Level</Label>
                  <Select
                    value={shareInfo.permission}
                    onValueChange={(v) =>
                      updatePermission(v as "view" | "edit")
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>View Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>Can Edit</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerateToken}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={deleteShare}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </TabsContent>

              {/* Embed Tab */}
              <TabsContent value="embed" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Embed Code</Label>
                  <div className="relative">
                    <textarea
                      value={embedCode}
                      readOnly
                      className="w-full h-24 p-3 font-mono text-xs bg-muted rounded-lg resize-none border border-border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyLink(embedCode, "Embed code")}
                    >
                      {copied === "Embed code" ? (
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Embed in Notion, blogs, portfolios, or any website
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Direct Embed URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={urls?.embed || ""}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyLink(urls?.embed || "", "Embed URL")}
                    >
                      {copied === "Embed URL" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <strong>Embed Options:</strong>
                  <ul className="mt-1 space-y-1 ml-4 list-disc">
                    <li>
                      <code>?branding=false</code> - Hide SlideForge branding
                    </li>
                    <li>
                      <code>?autoplay=true</code> - Auto-advance slides
                    </li>
                    <li>
                      <code>?interval=5000</code> - Autoplay interval (ms)
                    </li>
                    <li>
                      <code>?slide=2</code> - Start on specific slide
                    </li>
                  </ul>
                </div>
              </TabsContent>

              {/* Live Tab */}
              <TabsContent value="live" className="space-y-4 mt-4">
                <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="h-5 w-5 text-violet-500" />
                    <span className="font-semibold">
                      Live Presentation Mode
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Present in real-time. Your audience sees slides change as
                    you navigate.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Presenter Link (for you)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={urls?.livePresenter || ""}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyLink(urls?.livePresenter || "", "Presenter link")
                      }
                    >
                      {copied === "Presenter link" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Audience Link (share with viewers)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={urls?.live || ""}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyLink(urls?.live || "", "Audience link")
                      }
                    >
                      {copied === "Audience link" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => window.open(urls?.livePresenter, "_blank")}
                >
                  <Presentation className="h-4 w-4 mr-2" />
                  Start Live Presentation
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
