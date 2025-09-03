import { useState } from "react";
import DataModal from "../modal/Modal";
import DocumentationForm from "../form/DocumentationForm";
import Icon from "../Icon";
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
                <Icon name="edit" size={24} />
              </button>
              <button
                onClick={() => onDelete(doc.id)}
                title="Удалить документацию"
              >
                <Icon name="delete" size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleOpenAdd}
        className={`${style.projects__column__item} ${style["projects__column__item--btn"]}`}
      >
        <Icon name="plus" size={20} />
        Добавить документацию
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
