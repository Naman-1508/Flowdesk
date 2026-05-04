"use client";

import { useSession, signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GitBranch, MessageSquare, Trash2, Bell, Keyboard, Clock } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export default function SettingsPage() {
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id as any;
  const user = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const updateSettings = useMutation(api.users.updateSettings);

  const [defaultSessionMins, setDefaultSessionMins] = useState(25);
  const [defaultTotalSessions, setDefaultTotalSessions] = useState(4);
  const [slackToken, setSlackToken] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync state with DB when user loads
  import { useEffect } from "react";
  useEffect(() => {
    if (user) {
      if (user.defaultSessionMins) setDefaultSessionMins(user.defaultSessionMins);
      if (user.defaultTotalSessions) setDefaultTotalSessions(user.defaultTotalSessions);
      if (user.slackToken) setSlackToken(user.slackToken);
    }
  }, [user]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateSettings({ 
        userId, 
        defaultSessionMins, 
        defaultTotalSessions,
        slackToken: slackToken || undefined
      });
    } finally {
      setSaving(false);
    }
  };

  const requestNotifications = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-syne font-bold mb-2">Settings</h1>
        <p className="text-muted font-mono">Manage your integrations and focus preferences.</p>
      </div>

      <div className="space-y-6">
        {/* GitHub Integration */}
        <Card className="border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center border border-border">
                <GitBranch size={20} className="text-text" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-lg">GitHub</h3>
                <p className="text-xs text-muted font-mono">Connected as {authSession?.user?.name}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => signOut()}>
              Disconnect
            </Button>
          </div>
          <div className="text-sm font-mono text-muted bg-surface2 p-3 rounded-lg border border-border/50">
            FlowDesk has access to read your public and private repositories and issues.
          </div>
        </Card>

        {/* MessageSquare Integration */}
        <Card className="border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center border border-border">
                <MessageSquare size={20} className="text-text" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-lg">Slack Status</h3>
                <p className="text-xs text-muted font-mono">Auto-update status when focusing</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-mono text-text block mb-2">User OAuth Token</label>
              <input
                type="password"
                value={slackToken}
                onChange={(e) => setSlackToken(e.target.value)}
                placeholder="xoxp-..."
                className="w-full bg-surface2 border border-border rounded-lg px-4 py-2 text-sm text-text outline-none focus:border-accent font-mono transition-colors"
              />
              <p className="text-xs text-muted mt-2 font-mono">
                Create a Slack app in your workspace and add the <strong>users.profile:write</strong> scope to get your User OAuth Token.
              </p>
            </div>

            {slackToken && (
              <div className="flex items-center gap-2 text-sm font-mono text-muted bg-surface2 p-3 rounded-lg border border-border/50">
                Preview: <span className="text-text">🔴 In a Focus Session</span>
              </div>
            )}
            
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Slack Token"}
            </Button>
          </div>
        </Card>

        {/* Focus Defaults */}
        <Card className="border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={20} className="text-muted" />
            <h3 className="font-syne font-bold text-lg">Focus Defaults</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-mono text-text">Default Session Length</label>
                <span className="text-sm font-mono text-accent">{defaultSessionMins}m</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={defaultSessionMins}
                onChange={(e) => setDefaultSessionMins(parseInt(e.target.value))}
                className="w-full accent-accent bg-surface2 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-mono text-text">Sessions per Cycle (before long break)</label>
                <span className="text-sm font-mono text-accent">{defaultTotalSessions}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={defaultTotalSessions}
                onChange={(e) => setDefaultTotalSessions(parseInt(e.target.value))}
                className="w-full accent-accent bg-surface2 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center border border-border">
                <Bell size={20} className="text-muted" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-lg">Notifications</h3>
                <p className="text-xs text-muted font-mono">Get alerted when breaks start/end</p>
              </div>
            </div>
            <Button variant="secondary" onClick={requestNotifications}>
              Enable
            </Button>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Keyboard size={20} className="text-muted" />
            <h3 className="font-syne font-bold text-lg">Keyboard Shortcuts</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border/50">
              <span className="text-sm font-mono text-muted">Command Palette</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-surface border border-border rounded text-text">Cmd+K</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border/50">
              <span className="text-sm font-mono text-muted">Toggle Context Panel</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-surface border border-border rounded text-text">Cmd+N</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border/50">
              <span className="text-sm font-mono text-muted">Start Focus Session</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-surface border border-border rounded text-text">Cmd+Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border/50">
              <span className="text-sm font-mono text-muted">Pause/Resume Timer</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-surface border border-border rounded text-text">Space</kbd>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-danger/30 bg-danger/5 mt-12">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 size={20} className="text-danger" />
            <h3 className="font-syne font-bold text-lg text-danger">Danger Zone</h3>
          </div>
          <p className="text-sm font-mono text-muted mb-4">
            Permanently delete your account and all associated focus data, notes, and metrics.
          </p>
          <Button variant="danger">Delete Account</Button>
        </Card>
      </div>
    </div>
  );
}
