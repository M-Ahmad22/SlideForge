import { memo } from "react";
import { Download, Edit, Eye, ExternalLink, Presentation, Share2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideForgeHeaderProps {
  title: string;
  permission?: 'view' | 'edit';
  showBranding?: boolean;
  compact?: boolean;
  onExport?: () => void;
  onPresent?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const SlideForgeHeader = memo(function SlideForgeHeader({
  title,
  permission = 'view',
  showBranding = true,
  compact = false,
  onExport,
  onPresent,
  onEdit,
  className,
}: SlideForgeHeaderProps) {
  return (
    <header 
      className={cn(
        "flex items-center justify-between px-4 bg-slate-900 text-white border-b border-slate-800",
        compact ? "h-10 py-1" : "h-14 py-2",
        className
      )}
    >
      {/* Left: Branding + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {showBranding && (
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              "rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center",
              compact ? "h-6 w-6" : "h-8 w-8"
            )}>
              <Zap className={cn("text-white", compact ? "h-3 w-3" : "h-4 w-4")} />
            </div>
            {!compact && (
              <span className="font-bold text-lg tracking-tight">
                Slide<span className="text-violet-400">Forge</span>
              </span>
            )}
          </div>
        )}
        
        <div className="h-6 w-px bg-slate-700 shrink-0" />
        
        <h1 className={cn(
          "font-medium truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {title}
        </h1>
        
        {permission && (
          <span className={cn(
            "shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            permission === 'edit' 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-slate-700 text-slate-300"
          )}>
            {permission === 'edit' ? (
              <>
                <Edit className="h-3 w-3" />
                Editor
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                Viewer
              </>
            )}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onPresent && (
          <button
            onClick={onPresent}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors",
              compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            )}
          >
            <Presentation className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            Present
          </button>
        )}
        
        {permission === 'edit' && onEdit && (
          <button
            onClick={onEdit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors",
              compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            )}
          >
            <Edit className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            Edit
          </button>
        )}
        
        {onExport && (
          <button
            onClick={onExport}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium transition-colors",
              compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            )}
          >
            <Download className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            Export
          </button>
        )}
      </div>
    </header>
  );
});

export default SlideForgeHeader;
