import { useState } from 'react';
import { useIdioma } from '@/i18n/useIdioma';
import './CampoSenha.css';

// Campo de senha com o botão de olho: a pessoa vê o que digitou para conferir antes de enviar.
export default function CampoSenha({ className = 'input', ...props }) {
  const [visivel, setVisivel] = useState(false);
  const { t } = useIdioma();
  const rotulo = t(visivel ? 'comum.ocultarSenha' : 'comum.mostrarSenha');

  return (
    <div className="campo-senha">
      <input {...props} className={`${className} campo-senha__input`} type={visivel ? 'text' : 'password'} />
      <button
        type="button"
        className="campo-senha__olho"
        aria-label={rotulo}
        aria-pressed={visivel}
        title={rotulo}
        onClick={() => setVisivel(!visivel)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {visivel ? (
            <>
              <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
            </>
          ) : (
            <>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
