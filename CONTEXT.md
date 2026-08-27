# Club Grau (frontend)

Operator UI for the Club Grau platform. This glossary is the ubiquitous language shared with the employees context on the API. It is not a spec and not a folder map.

## Language

**Collaborator**:
A person who works on the salon floor and has an identity on the platform. The list and profile screens show Collaborators.
_Avoid_: user, account, victim

**Deactivate**:
Operational stop. Status becomes `INACTIVE`; identity and email remain. MANAGER may Deactivate only `EMPLOYEE`. ADMIN may Deactivate `EMPLOYEE`, `MANAGER`, and `ADMIN`, except the Last Admin.
_Avoid_: delete, remove, excluir

**Reactivate**:
Restore of the same identity: `INACTIVE` → `ACTIVE` on the same `employeeId`, including any history already bound to that id. MANAGER may Reactivate only `EMPLOYEE`. ADMIN may Reactivate any role. EMPLOYEE Reactivates nobody. A person who returns to the salon takes this path, not Remove+Create.
_Avoid_: create again, undelete, reopen account, Remove+Create

**Remove**:
Intent to take a Collaborator off the platform. Only an ADMIN may execute it, and only from `INACTIVE`. The implementation is Anonymize, never deleting the document.
_Avoid_: delete, destroy, hard delete

**Anonymize**:
Replacement of personal data with sentinels, keeping the id, setting terminal status `REMOVED`, and freeing the original email.
_Avoid_: hard delete, erase identity, GDPR erase of the id

**Role**:
`EMPLOYEE` | `MANAGER` | `ADMIN` on an identity. The Actor’s Role is the switch that decides which operator actions the UI shows. Combined with the Target’s Role and status, it mirrors the authority matrix for visibility only.
_Avoid_: permission catalog, ACL, permissão as a separate entity, `/me` as the source of Role

**Actor**:
The authenticated operator who executes a lifecycle command. Their Role comes from the session (JWT payload). For Remove, the modal asks only for their password (not the Target’s, not `passwordConfirmation`, not the Target’s name typed out).
_Avoid_: Target password, passwordConfirmation, MANAGER acting on ADMIN

**Target**:
The Collaborator the Actor acts on. On the INACTIVE screen the Target is a candidate for Reactivate or Remove. May be `ADMIN`, `MANAGER`, or `EMPLOYEE` — the Target’s role does not by itself block Remove.
_Avoid_: victim, user, account

**Removed**:
Terminal state after Anonymize. Absent from the Collaborators list. The `employeeId` remains so other contexts can still point at that identity.
_Avoid_: deleted, hidden, archived, inactive

**Last Admin**:
The only `ADMIN` who can still log in (`ACTIVE`), or — for Remove — the only `ADMIN` who is not `REMOVED`. Cannot leave `ACTIVE` (Deactivate / Vacation) while they are the last `ACTIVE` ADMIN; leftover `INACTIVE` / `VACATION` ADMINs do not count as a second login. Cannot be Removed while they are the last non-`REMOVED` ADMIN.
_Avoid_: last user, only login

**INACTIVE fork**:
The operator experience when the Target is already `INACTIVE`: Reactivate or Remove. Remove is never offered from `ACTIVE` or `VACATION`.
_Avoid_: delete dialog, inactivate-then-remove shortcut
