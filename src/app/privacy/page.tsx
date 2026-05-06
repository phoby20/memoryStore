import Link from "next/link";

export const metadata = {
  title: "개인정보 처리방침 — Memory Store",
};

const EFFECTIVE_DATE = "2026년 5월 3일";
const CONTACT_EMAIL = "privacy@memorystore.app";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0f0f13" }}>
      <header className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl">🧠</Link>
          <span className="text-white font-medium">Memory Store</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">개인정보 처리방침</h1>
        <p className="text-gray-500 text-sm mb-10">시행일: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <Section title="1. 개요">
            <p>
              Memory Store(이하 "서비스")는 사용자의 개인정보를 중요시하며,
              「개인정보 보호법」을 준수합니다. 본 방침은 서비스가 어떤 정보를
              수집하고, 어떻게 이용하며, 어떻게 보호하는지를 설명합니다.
            </p>
          </Section>

          <Section title="2. 수집하는 개인정보">
            <Table
              headers={["구분", "항목", "수집 방법", "보관 위치"]}
              rows={[
                ["인증 정보", "이메일, 이름, 프로필 사진", "Google 로그인", "Clerk (위탁)"],
                ["서비스 이용 정보", "사용자가 직접 입력한 메모리 (취향, 목표 등)", "직접 입력", "서비스 DB"],
                ["민감 정보", "건강 정보, 재무 정보 (입력한 경우)", "직접 입력", "서비스 DB"],
              ]}
            />
            <p className="mt-3 text-sm text-yellow-400/80">
              ⚠️ 건강 및 재무 카테고리의 정보는 민감한 개인정보에 해당합니다.
              해당 정보는 사용자가 직접 선택하여 입력한 경우에만 저장됩니다.
            </p>
          </Section>

          <Section title="3. 개인정보 이용 목적">
            <ul className="list-disc pl-5 space-y-1">
              <li>AI 비서에게 사용자 맥락을 제공하는 메모리 서비스 운영</li>
              <li>회원 식별 및 서비스 접근 인증</li>
              <li>서비스 개선 및 오류 처리</li>
              <li>법령 의무 이행 및 분쟁 해결</li>
            </ul>
          </Section>

          <Section title="4. 개인정보 보유 및 파기">
            <Table
              headers={["정보", "보유 기간", "파기 방법"]}
              rows={[
                ["메모리 데이터", "회원 탈퇴 시까지", "즉시 완전 삭제"],
                ["인증 정보 (Clerk)", "회원 탈퇴 시까지", "Clerk 정책에 따라 삭제"],
                ["서비스 로그", "최대 30일", "자동 삭제"],
              ]}
            />
            <p className="mt-3 text-sm text-gray-400">
              회원 탈퇴 시 서비스에 저장된 모든 메모리 데이터와 API 키는
              즉시 삭제되며 복구할 수 없습니다.
            </p>
          </Section>

          <Section title="5. 개인정보 제3자 제공 및 위탁">
            <Table
              headers={["수탁업체", "위탁 업무", "보유 기간"]}
              rows={[
                ["Clerk, Inc.", "회원 인증 및 계정 관리 (Google OAuth)", "회원 탈퇴 시"],
              ]}
            />
            <p className="mt-3 text-sm text-gray-400">
              위 경우 외에는 사전 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            </p>
          </Section>

          <Section title="6. 사용자의 권리">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">열람권</strong> — 저장된 메모리는 대시보드에서 언제든 확인 가능</li>
              <li><strong className="text-white">수정권</strong> — 대시보드에서 직접 수정 가능</li>
              <li><strong className="text-white">삭제권</strong> — 개별 삭제 또는 회원 탈퇴로 전체 삭제</li>
              <li><strong className="text-white">이의제기권</strong> — 아래 연락처로 문의</li>
            </ul>
          </Section>

          <Section title="7. 개인정보 보호를 위한 기술적 조치">
            <ul className="list-disc pl-5 space-y-1">
              <li>HTTPS 암호화 통신 적용</li>
              <li>API 키 기반 접근 제어</li>
              <li>Clerk OAuth를 통한 안전한 인증 (비밀번호 직접 저장 없음)</li>
              <li>사용자별 데이터 격리 (다른 사용자의 데이터 접근 불가)</li>
            </ul>
          </Section>

          <Section title="8. 쿠키 사용">
            <p>
              서비스는 로그인 세션 유지를 위해 Clerk이 설정하는 쿠키를 사용합니다.
              브라우저 설정에서 쿠키를 차단할 수 있으나, 이 경우 로그인 기능이 작동하지 않습니다.
            </p>
          </Section>

          <Section title="9. 개인정보 보호 책임자">
            <Table
              headers={["항목", "내용"]}
              rows={[
                ["이메일", CONTACT_EMAIL],
                ["처리 기간", "수신 후 10영업일 이내"],
              ]}
            />
          </Section>

          <Section title="10. 방침 변경">
            <p>
              본 방침이 변경될 경우 시행 7일 전 서비스 내 공지를 통해 안내합니다.
              중요한 변경 사항은 이메일로도 별도 통지합니다.
            </p>
          </Section>

        </div>

        <div className="mt-16 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.05)" }}>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-gray-300 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-400 text-xs">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
