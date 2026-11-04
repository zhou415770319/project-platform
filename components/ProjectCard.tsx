import Link from "next/link";
import { STATUS_BADGE, STATUS_LABEL, type Project } from "@/types/project";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project?id=${encodeURIComponent(project.id)}`} className="card">
      {project.cover ? (
        <div
          className="card-cover"
          style={{ backgroundImage: `url(${project.cover})` }}
        />
      ) : (
        <div className="card-cover">📁 {project.name}</div>
      )}
      <div className="card-body">
        <div className="card-title-row">
          <h3 className="card-title">{project.name}</h3>
          <span className={STATUS_BADGE[project.status]}>
            {STATUS_LABEL[project.status]}
          </span>
          {typeof project.completion === "number" && (
            <span className="badge badge-completion">{project.completion}%</span>
          )}
        </div>
        <p className="card-desc">{project.shortDesc}</p>
        <div className="card-foot">
          <span>{project.devTool ? `🔧 ${project.devTool}` : "—"}</span>
          <span>查看详情 →</span>
        </div>
      </div>
    </Link>
  );
}
