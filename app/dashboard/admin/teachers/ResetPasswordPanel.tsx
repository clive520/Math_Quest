"use client";

import { useActionState } from "react";
import {
  resetTeacherPassword,
  type ResetTeacherPasswordState,
} from "./actions";

type ResetPasswordPanelProps = {
  displayName: string;
  teacherId: string;
};

const initialState: ResetTeacherPasswordState = {};

export function ResetPasswordPanel({ displayName, teacherId }: ResetPasswordPanelProps) {
  const [state, formAction, pending] = useActionState(resetTeacherPassword, initialState);

  return (
    <div className="reset-panel">
      <form action={formAction}>
        <input name="teacher_id" type="hidden" value={teacherId} />
        <button className="text-button" disabled={pending} type="submit">
          {pending ? "重設中..." : "重設臨時密碼"}
        </button>
      </form>

      {state.error ? <p className="notice error compact-notice">{state.error}</p> : null}

      {state.temporaryPassword ? (
        <div className="temporary-password-box">
          <p>{state.message}</p>
          <strong>{state.temporaryPassword}</strong>
          <a className="primary-link" href={state.mailtoHref}>
            用 Email 通知老師
          </a>
          <p className="muted-line">
            請只將這組密碼提供給 {state.displayName ?? displayName} 老師本人。
          </p>
        </div>
      ) : null}
    </div>
  );
}
