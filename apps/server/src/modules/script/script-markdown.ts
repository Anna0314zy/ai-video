import type { LlmMessage } from '../../llm/llm-provider.js'

export const SCRIPT_MARKDOWN_SYSTEM_PROMPT = [
  '你必须输出标准 Markdown。',
  '如果输出代码，必须使用 fenced code block，并标注语言，例如 ```js、```ts、```html。',
  '不要输出未被 ``` 包裹的裸代码。',
  '列表、标题、表格、引用等内容也必须使用标准 Markdown 语法。',
  '除非用户明确要求纯文本，否则不要解释 Markdown 规则本身。',
].join('\n')

export function withScriptMarkdownSystemPrompt(messages: LlmMessage[]): LlmMessage[] {
  if (messages[0]?.role === 'system') {
    return [
      {
        role: 'system',
        content: `${SCRIPT_MARKDOWN_SYSTEM_PROMPT}\n\n${messages[0].content}`,
      },
      ...messages.slice(1),
    ]
  }

  return [
    {
      role: 'system',
      content: SCRIPT_MARKDOWN_SYSTEM_PROMPT,
    },
    ...messages,
  ]
}
