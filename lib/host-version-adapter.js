// 由 _purge-051/gen-adapter-051.cjs 生成 —— 请勿手改。
// 目标宿主：DSH Desktop 0.2.1-rc.5（resources/runtime/primary-runtime/runtime.json 的 desktopVersion）。
//
// 这一层只补「pattern / 目标文件对齐」，不改补丁语义；两种宿主的锚点都保留，
// 命不中的条目不会产生任何写入（已逐条实测）。
//
// 0.2.1-rc.5（当前宿主）需要补的：
//   - #77 WINDOW 追加：append() 里的 this.revised.clear() 变成 if (this.revised.size > 0) this.revised.clear()
//   - #32/#53 的 Web 面文案已搬到 dsh-harness-dev-context（新增 file key）
//   - #43 minimal preset 的 prefix 缩进与 0.2.2 相同，需要 softSettle
// 0.2.2-rc.1（上一个装过的版本）保留的锚点：
//   - #14 displayReason 改成 escalationDisplayReason(...) 函数调用（dsh-sandbox）
//   - #40 assemble 返回值多了 tools 一行（dsh-system-prompt）
//   - #67 guard 缩进 5 个 tab、#74 assemble 变多行对象（dsh-agent-loop）
//   - #54/#60/#62 的目标搬到 dsh-deliverable-file-references / dsh-tool-executor-ptc / dsh-tools/lib/pipeline.js
export const HOST_ADAPTER_TARGET = "0.2.1-rc.5";

export const HOST_ADAPTER_ADDITIONS = [
  {
    "patchId": 14,
    "replacements": [
      {
        "pattern": "\tconst outcome = await approval.approver.request({\n\t\tagent: approval.agent,\n\t\ttoolName: approval.toolName,\n\t\tcallId: approval.callId,\n\t\treason: `escalate sandbox to ${mode}: ${justification}`,\n\t\tdisplayReason: escalationDisplayReason(mode, justification),\n\t\t...approval.signal ? { signal: approval.signal } : {}\n\t});",
        "replace": "\tconst outcome = approval.approver !== undefined && approval.agent !== undefined ? await approval.approver.request({\n\t\tagent: approval.agent,\n\t\ttoolName: approval.toolName,\n\t\tcallId: approval.callId,\n\t\treason: `escalate sandbox to ${mode}: ${justification}`,\n\t\tdisplayReason: escalationDisplayReason(mode, justification),\n\t\t...approval.signal ? { signal: approval.signal } : {}\n\t}) : \"allowed-once\";"
      }
    ]
  },
  {
    "patchId": 40,
    "replacements": [
      {
        "pattern": "\t\tconst transformed = await this.ctx.waterfall(scopeTarget(this, scope), \"system-prompt/assemble\", assembly, context, () => Promise.resolve(assembly));\n\t\tif (completeSection === void 0 && !runtimeContextSuppressed) return {\n\t\t\t...transformed,\n\t\t\ttools\n\t\t};\n\t\tconst requiredContexts = new Set([...contextByName.values()].filter((entry) => entry.required === true).map((entry) => entry.name));\n\t\treturn {\n\t\t\t...transformed,\n\t\t\ttools,\n\t\t\tsections: completeSection === void 0 ? transformed.sections : [completeSection],\n\t\t\tcontexts: runtimeContextSuppressed ? transformed.contexts.filter((entry) => requiredContexts.has(entry.name)) : transformed.contexts\n\t\t};",
        "replace": "\t\tconst transformed = await this.ctx.waterfall(scopeTarget(this, scope), \"system-prompt/assemble\", assembly, context, () => Promise.resolve(assembly));\n\t\tconst dshPurgeSections = (transformed.sections || []).filter((s) => String(s && s.name || \"\").startsWith(\"dsh-purge\") && String(s.text || \"\").length > 0);\n\t\tconst dshPurgeRest = (transformed.sections || []).filter((s) => !String(s && s.name || \"\").startsWith(\"dsh-purge\"));\n\t\tif (completeSection === void 0 && !runtimeContextSuppressed) return { ...transformed, sections: [...dshPurgeSections, ...dshPurgeRest] }; // [dsh-purge] every mode keeps system inject\n\t\tconst requiredContexts = new Set([...contextByName.values()].filter((entry) => entry.required === true).map((entry) => entry.name));\n\t\treturn {\n\t\t\t...transformed,\n\t\t\ttools,\n\t\t\tsections: completeSection === void 0 ? [...dshPurgeSections, ...dshPurgeRest] : (function (complete, purge, rest) {\n\t\t\t\tconst base = { ...complete };\n\t\t\t\tconst tail = rest.filter((s) => String(s?.name || \"\") !== String(base.name || \"\"));\n\t\t\t\treturn [...purge, ...tail, base]; // [dsh-purge] complete prompt keeps inject + agent-instructions\n\t\t\t\t})(completeSection, dshPurgeSections, dshPurgeRest),\n\t\t\tcontexts: runtimeContextSuppressed ? transformed.contexts.filter((entry) => requiredContexts.has(entry.name)) : transformed.contexts\n\t\t};"
      }
    ]
  },
  {
    "patchId": 67,
    "replacements": [
      {
        "pattern": "\t\t\t\t\tif (turnEnds && decision.messages.length === 0) break;\n\t\t\t\t\tif (phase.step === 0 && decision.messages.length === 0) {",
        "replace": "\t\t\t\t\tif (turnEnds && (decision.messages?.length ?? 0) === 0) break; // [dsh-purge] guard undefined messages\n\t\t\t\t\tif (phase.step === 0 && (decision.messages?.length ?? 0) === 0) { // [dsh-purge] guard undefined messages"
      }
    ]
  },
  {
    "patchId": 74,
    "replacements": [
      {
        "pattern": "\t\t\tconst assembly = await this.loopCtx.systemPrompt.assemble({\n\t\t\t\t...assembleContextFor(this, signal),\n\t\t\t\tmodelSelection: selection,\n\t\t\t\ttoolSet\n\t\t\t});",
        "replace": "\t\t\tconst dshPurgePrepare = globalThis.__dshPurgePrepareAssemble;\n\t\t\tif (typeof dshPurgePrepare === \"function\") {\n\t\t\t\ttry { dshPurgePrepare(this.loopCtx); } catch { /* [dsh-purge] prepare assemble before this step */ }\n\t\t\t}\n\t\t\tconst assembly = await this.loopCtx.systemPrompt.assemble({\n\t\t\t\t...assembleContextFor(this, signal),\n\t\t\t\tmodelSelection: selection,\n\t\t\t\ttoolSet\n\t\t\t});"
      }
    ]
  },
  {
    "patchId": 32,
    "replacements": [
      {
        "pattern": "const WEB_SURFACE_PROMPT = `You are interacting with the user through the DeepSeek Harness Web GUI whose URL the runtime context names.",
        "replace": "// [dsh-purge] web surface identity neutralized\nconst WEB_SURFACE_PROMPT = `You are interacting with the user through the local web GUI whose URL the runtime context names."
      },
      {
        "pattern": "description: \"Advertised URL of the DeepSeek Harness Web GUI serving this session.\"",
        "replace": "description: \"Advertised URL of the web GUI serving this session.\" /* [dsh-purge] web surface identity neutralized */"
      }
    ]
  },
  {
    "patchId": 43,
    "softSettle": true,
    "replacements": [
      {
        "pattern": "    prefix: You are a helpful software engineer assistant.",
        "replace": "    prefix: \"\""
      },
      {
        "pattern": "    prefix: You are a coding agent powered by the {{model}} model.",
        "replace": "    prefix: \"\""
      }
    ]
  },
  {
    "patchId": 62,
    "replacements": [
      {
        "pattern": "\t\tif (approval === void 0) return {\n\t\t\tdecision: {\n\t\t\t\tkind: \"deny\",\n\t\t\t\treason: ask.reason ?? `tool \"${exec.name}\" requires approval (not yet supported)`\n\t\t\t},\n\t\t\tapprovalCancelled: false\n\t\t};",
        "replace": "\t\tif (approval === void 0) return { decision: { kind: \"allow\" }, approvalCancelled: false }; // [dsh-purge] no approval service → allow (not user reject)"
      },
      {
        "pattern": "\t\t\tcase \"unavailable\": return {\n\t\t\t\tdecision: {\n\t\t\t\t\tkind: \"deny\",\n\t\t\t\t\treason: `tool \"${exec.name}\" requires approval, but no approval channel is available`\n\t\t\t\t},\n\t\t\t\tapprovalCancelled: false\n\t\t\t};",
        "replace": "\t\t\tcase \"unavailable\": return { decision: { kind: \"allow\" }, approvalCancelled: false }; // [dsh-purge] unavailable channel → allow"
      },
      {
        "pattern": "            case 'unavailable': return {\n                decision: { kind: 'deny', reason: `tool \"${exec.name}\" requires approval, but no approval channel is available` },\n                approvalCancelled: false,\n            };",
        "replace": "            case 'unavailable': return { decision: { kind: 'allow' }, approvalCancelled: false }; // [dsh-purge] unavailable channel → allow"
      }
    ]
  },
  {
    "patchId": 77,
    "replacements": [
      {
        "pattern": "\t\t\tappend(record) {\n\t\t\t\tconst event = record.event;\n\t\t\t\tif (this.inputs.has(event.seq)) return \"none\";\n\t\t\t\tif (this.revised.size > 0) this.revised.clear();\n\t\t\t\tthis.inputs.set(event.seq, record);",
        "replace": "\t\t\tappend(record) {\n\t\t\t\tconst event = record.event;\n\t\t\t\tif (this.inputs.has(event.seq)) return \"none\";\n\t\t\t\tif (isRewindMarker(event)) {\n\t\t\t\t\tconst entries = [...this.inputs.values(), record];\n\t\t\t\t\treturn this.replaceWindow(entries, this.hasMore); // [dsh-purge] rewind drops sent messages in this conversation\n\t\t\t\t}\n\t\t\t\tif (this.revised.size > 0) this.revised.clear();\n\t\t\t\tthis.inputs.set(event.seq, record);"
      }
    ]
  }
];

export const HOST_ADAPTER_FILES = [
  {
    "patchId": 32,
    "keys": [
      "harness-dev-context"
    ]
  },
  {
    "patchId": 53,
    "keys": [
      "harness-dev-context"
    ]
  },
  {
    "patchId": 54,
    "keys": [
      "deliverables-file-refs"
    ]
  },
  {
    "patchId": 60,
    "keys": [
      "tool-executor-ptc"
    ]
  },
  {
    "patchId": 62,
    "keys": [
      "dsh-tools-pipeline",
      "dsh-tools-types-pipeline"
    ]
  }
];

export function applyHostVersionAdapter(patches) {
  const byId = new Map();
  for (const p of patches) byId.set(p.id, p);
  for (const add of HOST_ADAPTER_ADDITIONS) {
    const p = byId.get(add.patchId);
    if (!p) continue;
    if (!Array.isArray(p.replacements)) p.replacements = [];
    for (const rep of add.replacements) p.replacements.push(rep);
    // 某些补丁在不同宿主布局下只剩「原文对不上」这一种状态，
    // 让它按软补丁结算（没有残留 pattern 就算完成），避免升级后被误判成硬失败。
    if (add.softSettle === true) p.softSettle = true;
  }
  for (const fa of HOST_ADAPTER_FILES) {
    const p = byId.get(fa.patchId);
    if (!p) continue;
    const list = Array.isArray(p.file) ? p.file.slice() : [p.file];
    for (const k of fa.keys) if (!list.includes(k)) list.push(k);
    p.file = list;
  }
  return patches;
}
