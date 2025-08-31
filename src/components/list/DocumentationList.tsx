import { useState } from "react";
import DataModal from "../modal/Modal";
import DocumentationForm from "../form/DocumentationForm";
import style from "../TeamWorks.module.scss";

import type { Project } from "../../types/projectTypes";

interface Props {
  selectedProject: Project | null;
  onAdd: (data: { title: string; url: string }) => void;
  onEdit: (
    documentationId: number,
    data: { title: string; url: string }
  ) => void;
  onDelete: (documentationId: number) => void;
}

const DocumentationList = ({
  selectedProject,
  onAdd,
  onEdit,
  onDelete,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editDocumentation, setEditDocumentation] = useState<{
    id: number;
    title: string;
    url: string;
  } | null>(null);

  const handleOpenAdd = () => {
    setEditDocumentation(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (documentation: {
    id: number;
    title: string;
    url: string;
  }) => {
    setEditDocumentation(documentation);
    setModalOpen(true);
  };

  const handleSubmit = (formData: { title: string; url: string }) => {
    if (editDocumentation) {
      onEdit(editDocumentation.id, formData);
    } else {
      onAdd(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className={style.projects__column}>
      <div className={style.projects__column__header}>
        <h3>Документация</h3>
      </div>

      <div className={style["projects__column__items-container"]}>
        {selectedProject?.documentation.map((doc) => (
          <div
            key={doc.id}
            className={style.projects__column__item}
            onDoubleClick={() => handleOpenEdit(doc)}
          >
            <a href={doc.url}>
              <strong>{doc.title}</strong>
            </a>
            <div className={`${style.projects__column__item__controll}`}>
              <button onClick={() => handleOpenEdit(doc)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-edit"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(doc.id)}
                title="Удалить документацию"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-trash"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleOpenAdd}
        className={`${style.projects__column__item} ${style["projects__column__item--btn"]}`}
      >
        + Добавить документацию
      </button>

      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editDocumentation
            ? "Редактирование документации"
            : "Создание документации"
        }
        data={editDocumentation}
      >
        {() => (
          <DocumentationForm
            onSubmit={handleSubmit}
            initialTitle={editDocumentation?.title}
            initialUrl={editDocumentation?.url}
          />
        )}
      </DataModal>
    </div>
  );
};

export default DocumentationList;
