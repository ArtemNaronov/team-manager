import { useState } from "react";
import style from "./ProjectForm.module.scss";

type Props = {
  onSubmit: (formData: { title: string; url: string }) => void;
  initialTitle?: string;
  initialUrl?: string;
};

const DocumentationForm = ({
  onSubmit,
  initialTitle = "",
  initialUrl = "",
}: Props) => {
  const [title, setTitle] = useState(initialTitle);
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, url });
  };

  return (
    <form onSubmit={handleSubmit} className={style.form}>
      <div className={style.formFields}>
        <div className={style.field}>
          <label className={style.label}>Название документации</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={style.input}
            placeholder="Введите название документации"
            required
          />
        </div>

        <div className={style.field}>
          <label className={style.label}>Укажите ссылку на документацию</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={style.input}
            placeholder="Введите ссылку на документацию"
            required
          />
        </div>
      </div>

      <div className={style.formActions}>
        <button type="submit" className={style.button}>
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default DocumentationForm;
