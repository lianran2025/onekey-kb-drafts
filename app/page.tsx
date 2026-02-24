export default function HomePage() {
  return (
    <div className="card">
      <h1 className="h1">OneKey KB Draft Pages</h1>
      <p className="muted">
        这是一个用于“生成/展示知识库草稿文章”的独立站点。每篇文章都有独立页面，方便你直接复制粘贴到 Intercom。
      </p>
      <hr className="hr" />
      <div className="row">
        <a className="btn" href="/kb">查看文章列表</a>
        <span className="badge">公开访问</span>
        <span className="badge">默认中文</span>
        <span className="badge">URL=自动 slug</span>
      </div>
      <hr className="hr" />
      <p className="muted">
        复制建议：打开具体文章页后，点击 <span className="kbd">复制（富文本/HTML）</span>，再到 Intercom 编辑器粘贴。
      </p>
    </div>
  );
}
