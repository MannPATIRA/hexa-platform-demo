import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PolicyPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="px-8 pt-8 pb-2">
        <h1 className="text-[28px] font-normal text-foreground font-[family-name:var(--font-serif)]">Policy & Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage claim rules and notification preferences</p>
      </div>
      <div className="px-8 pb-8 pt-4 space-y-6 max-w-4xl">

      {/* Claim Policy */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-[13px] font-medium">Claim Policy Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Auto-Claim Minimum</p>
              <p className="text-xl font-medium mt-0.5">£250</p>
              <p className="text-xs text-muted-foreground mt-1">
                Credits ≥ £250 with HIGH confidence are automatically recommended as &quot;Claim&quot;
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Do-Not-Claim Ceiling</p>
              <p className="text-xl font-medium mt-0.5">£100</p>
              <p className="text-xs text-muted-foreground mt-1">
                Credits below £100 are recommended as &quot;Do Not Claim&quot; — admin cost exceeds value
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <p className="text-xs text-muted-foreground mb-3">Recommendation Logic</p>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 text-[13px] text-primary font-medium w-28">Claim</td>
                  <td className="py-2.5 text-[13px] text-muted-foreground">
                    Credit ≥ £250, HIGH confidence, clear breach with no buyer-caused issues
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 text-[13px] text-muted-foreground font-medium">Review</td>
                  <td className="py-2.5 text-[13px] text-muted-foreground">
                    Credit between £100–£250, or MEDIUM/LOW confidence, or first offence for supplier
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-[13px] text-muted-foreground font-medium">Do Not Claim</td>
                  <td className="py-2.5 text-[13px] text-muted-foreground">
                    Credit &lt; £100, buyer-caused delay, or waiver/force majeure noted
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-[13px] font-medium">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left font-medium py-2">Channel</th>
                <th className="text-left font-medium py-2">Description</th>
                <th className="text-right font-medium py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2.5 text-[13px] font-medium">Email</td>
                <td className="py-2.5 text-[13px] text-muted-foreground">Primary channel — generates claim email with evidence pack</td>
                <td className="py-2.5 text-[13px] text-right text-primary">Active</td>
              </tr>
              <tr className="border-b">
                <td className="py-2.5 text-[13px] font-medium">WhatsApp</td>
                <td className="py-2.5 text-[13px] text-muted-foreground">Secondary channel — instant notifications for urgent claims</td>
                <td className="py-2.5 text-[13px] text-right text-muted-foreground">Coming soon</td>
              </tr>
              <tr>
                <td className="py-2.5 text-[13px] font-medium">Scheduled Reports</td>
                <td className="py-2.5 text-[13px] text-muted-foreground">Weekly SLA summary email to account owners</td>
                <td className="py-2.5 text-[13px] text-right text-muted-foreground">Coming soon</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-[13px] font-medium">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between py-1">
              <span className="text-[13px] text-muted-foreground">Environment</span>
              <span className="text-[13px] font-medium">Demo</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[13px] text-muted-foreground">Data Range</span>
              <span className="text-[13px] font-medium">90 days</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[13px] text-muted-foreground">Suppliers Tracked</span>
              <span className="text-[13px] font-medium">5</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[13px] text-muted-foreground">Active SLA Rules</span>
              <span className="text-[13px] font-medium">15</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
