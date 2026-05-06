import Link from "next/link";

export const metadata = {
  title: "이용약관 — Memory Store",
};

const EFFECTIVE_DATE = "2026년 5월 3일";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0f0f13" }}>
      <header className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl">🧠</Link>
          <span className="text-white font-medium">Memory Store</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">이용약관</h1>
        <p className="text-gray-500 text-sm mb-10">시행일: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <Section title="제1조 (목적)">
            <p>
              본 약관은 Memory Store(이하 "서비스")가 제공하는 AI 비서 장기 메모리 서비스의
              이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (약관의 효력 및 변경)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>본 약관은 서비스를 이용하고자 하는 모든 사용자에게 적용됩니다.</li>
              <li>서비스는 합리적인 사유가 있을 경우 약관을 변경할 수 있으며, 변경 시 시행 7일 전 서비스 내 공지합니다.</li>
              <li>변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 회원 탈퇴를 할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (서비스 내용)">
            <p className="mb-3">서비스는 다음 기능을 제공합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>사용자가 직접 입력하는 개인 메모리 저장 및 관리</li>
              <li>카테고리별 메모리 분류 및 검색</li>
              <li>API를 통한 외부 AI 서비스(Claude 등) 연동</li>
              <li>Google 계정 기반 회원 인증</li>
            </ul>
          </Section>

          <Section title="제4조 (회원가입 및 계정)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스는 Google OAuth를 통한 회원가입만 지원합니다.</li>
              <li>1인 1계정을 원칙으로 하며, 타인의 정보를 이용한 가입은 금지됩니다.</li>
              <li>계정 관리 책임은 이용자에게 있으며, API 키의 보안 유지 의무는 이용자에게 있습니다.</li>
              <li>계정 정보가 유출된 경우 즉시 서비스에 통보하여야 합니다.</li>
            </ol>
          </Section>

          <Section title="제5조 (이용자의 의무)">
            <p className="mb-3">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>타인의 개인정보 및 계정 정보 도용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 통한 불법 정보 저장 및 유포</li>
              <li>서비스의 소스코드 역분석, 무단 복제 또는 배포</li>
              <li>API를 이용한 과도한 요청으로 서버에 부하를 주는 행위</li>
              <li>기타 관련 법령 및 본 약관에 위반되는 행위</li>
            </ul>
          </Section>

          <Section title="제6조 (서비스 제공 및 중단)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스는 연중 24시간 제공을 원칙으로 하나, 정기 점검 또는 불가피한 사유로 일시 중단될 수 있습니다.</li>
              <li>서비스 중단 시 사전에 공지하며, 긴급한 경우 사후 공지할 수 있습니다.</li>
              <li>서비스는 무료 플랜의 경우 사전 통보 후 기능을 변경하거나 서비스를 종료할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (데이터 소유권)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용자가 서비스에 저장한 메모리 데이터의 소유권은 이용자에게 있습니다.</li>
              <li>서비스는 이용자의 동의 없이 메모리 데이터를 제3자에게 제공하거나 마케팅에 활용하지 않습니다.</li>
              <li>서비스는 서비스 운영 및 품질 향상을 위해 익명화된 통계 데이터를 활용할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제8조 (책임 제한)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스는 이용자의 귀책사유로 발생한 손해에 대해 책임을 지지 않습니다.</li>
              <li>서비스는 천재지변, 전쟁, 해킹 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
              <li>서비스는 이용자가 저장한 메모리 데이터의 정확성·신뢰성에 대해 보증하지 않습니다.</li>
              <li>서비스의 손해배상 책임은 최근 3개월간 이용자가 납부한 요금을 한도로 합니다.</li>
            </ol>
          </Section>

          <Section title="제9조 (계약 해지 및 이용 제한)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용자는 언제든지 설정 페이지에서 회원 탈퇴를 통해 계약을 해지할 수 있습니다.</li>
              <li>탈퇴 시 저장된 모든 데이터는 즉시 삭제되며 복구할 수 없습니다.</li>
              <li>서비스는 이용자가 본 약관을 위반한 경우 사전 통보 후 이용을 제한하거나 계정을 해지할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제10조 (분쟁 해결)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스 이용과 관련하여 분쟁이 발생한 경우 협의를 통해 해결하는 것을 원칙으로 합니다.</li>
              <li>협의가 되지 않을 경우 관련 법령에 따른 법원을 관할 법원으로 합니다.</li>
              <li>본 약관은 대한민국 법령에 따라 해석됩니다.</li>
            </ol>
          </Section>

        </div>

        <div className="mt-16 pt-8 flex items-center gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            ← 홈으로 돌아가기
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            개인정보 처리방침
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
