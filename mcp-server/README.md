# Memory Store MCP Server

Claude에 Memory Store를 연결하는 MCP 서버입니다.

## Claude Desktop 설정

`~/.claude/claude_desktop_config.json` 파일에 아래 내용을 추가하세요:

```json
{
  "mcpServers": {
    "memory-store": {
      "command": "node",
      "args": ["/Users/parkkwansung/Documents/開発関連/freedom/mcp-server/index.js"],
      "env": {
        "MEMORY_STORE_URL": "http://localhost:3000",
        "MEMORY_STORE_API_KEY": "여기에_API_키_입력"
      }
    }
  }
}
```

## 사용 가능한 도구

- `get_memories` — 전체 또는 카테고리별 메모리 조회
- `search_memories` — 키워드 검색
- `save_memory` — 새 메모리 저장
- `delete_memory` — 메모리 삭제
