import React, { useEffect } from 'react';
import { basename } from 'node:path';
import { render } from 'ink';
import { getProjectRoot, getPackageVersion, loadSettings } from '../shared/config.js';
import { eventBus } from '../shared/event-bus.js';
import { DashboardApp } from './app.js';
import { normalizeDashboardRenderMode, type DashboardRenderMode } from './theme.js';

interface DashboardRunnerProps {
  projectName: string;
  version: string;
  renderMode: DashboardRenderMode;
  run?: () => Promise<void>;
  command: 'launch' | 'team-start' | 'status' | 'team-status';
  keepOpenAfterRun: boolean;
  onRunComplete: () => void;
  onRunError: (error: unknown) => void;
}

function DashboardRunner({
  projectName,
  version,
  renderMode,
  run,
  command,
  keepOpenAfterRun,
  onRunComplete,
  onRunError,
}: DashboardRunnerProps) {
  useEffect(() => {
    eventBus.emit('hud:session', { command, state: 'running' });
    if (!run) return;
    let active = true;
    run()
      .then(() => {
        if (!active) return;
        eventBus.emit('hud:session', { command, state: 'done' });
        if (!keepOpenAfterRun) onRunComplete();
      })
      .catch((error) => {
        if (!active) return;
        eventBus.emit('hud:session', {
          command,
          state: 'failed',
          message: error instanceof Error ? error.message : String(error),
        });
        onRunError(error);
      });
    return () => {
      active = false;
    };
  }, [command, keepOpenAfterRun, onRunComplete, onRunError, run]);

  return React.createElement(DashboardApp, { projectName, version, renderMode });
}

export interface DashboardSessionOptions {
  run?: () => Promise<void>;
  command: 'launch' | 'team-start' | 'status' | 'team-status';
  keepOpenAfterRun?: boolean;
  renderMode?: DashboardRenderMode;
}

export async function runDashboardSession(options: DashboardSessionOptions): Promise<void> {
  const settings = loadSettings();
  const renderMode = normalizeDashboardRenderMode(options.renderMode ?? settings.dashboardStyle);
  const projectName = basename(getProjectRoot());
  const version = getPackageVersion();
  let runError: unknown;

  let app: ReturnType<typeof render>;
  app = render(
    React.createElement(DashboardRunner, {
      projectName,
      version,
      renderMode,
      run: options.run,
      command: options.command,
      keepOpenAfterRun: options.keepOpenAfterRun ?? false,
      onRunComplete: () => app.unmount(),
      onRunError: (error: unknown) => {
        runError = error;
        app.unmount();
      },
    }),
  );

  await app.waitUntilExit();
  if (runError) throw runError;
}
