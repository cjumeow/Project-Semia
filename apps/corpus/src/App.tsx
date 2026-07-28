import { MOCK_VIDEO_GROUPS } from './data/mockCorpus';
import { useCorpusSelection } from './hooks/useCorpusSelection';
import { useResizableWidth } from './hooks/useResizableWidth';
import { CorpusSidebar } from './components/CorpusSidebar';
import { ResizeHandle } from './components/ResizeHandle';
import { SnippetDetail } from './components/SnippetDetail';
import { VideoWorkspace } from './components/VideoWorkspace';

export default function App() {
  const {
    selection,
    selectedGroup,
    selectedSnippet,
    selectVideo,
    selectSnippet,
  } = useCorpusSelection(MOCK_VIDEO_GROUPS);

  const { width: sidebarWidth, onResizeStart } = useResizableWidth({
    min: 160,
    max: 480,
    defaultWidth: 220,
    storageKey: 'semia-corpus-sidebar-width',
  });

  return (
    <main className="flex h-screen overflow-hidden bg-canvas">
      <div
        className="flex h-full shrink-0 flex-col border-r border-border"
        style={{ width: sidebarWidth }}
      >
        <CorpusSidebar
          groups={MOCK_VIDEO_GROUPS}
          selectedVideoId={selection.videoId}
          onSelectVideo={selectVideo}
        />
      </div>

      <ResizeHandle onResizeStart={onResizeStart} />

      <VideoWorkspace
        group={selectedGroup}
        selectedSnippetId={selection.snippetId}
        seekSeconds={selectedSnippet?.start}
        onSelectSnippet={selectSnippet}
      />

      <SnippetDetail snippet={selectedSnippet} />
    </main>
  );
}
