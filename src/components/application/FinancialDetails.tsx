import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialDetailsProps {
  data: any;
  updateData: (section: string, data: any) => void;
}

export function FinancialDetails({ data, updateData }: FinancialDetailsProps) {
  const handleChange = (field: string, value: string) => {
    updateData('financial', { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Income Details */}
      <Card>
        <CardHeader>
          <CardTitle>Income Details (Annual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fee Collection (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter fee collection"
                value={data.financial?.feeCollection || ''}
                onChange={(e) => handleChange('feeCollection', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Government Grants (₹)</Label>
              <Input
                type="number"
                placeholder="Enter government grants"
                value={data.financial?.governmentGrants || ''}
                onChange={(e) => handleChange('governmentGrants', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Research Funding (₹)</Label>
              <Input
                type="number"
                placeholder="Enter research funding"
                value={data.financial?.researchFunding || ''}
                onChange={(e) => handleChange('researchFunding', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Other Income (₹)</Label>
              <Input
                type="number"
                placeholder="Enter other income"
                value={data.financial?.otherIncome || ''}
                onChange={(e) => handleChange('otherIncome', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenditure Details */}
      <Card>
        <CardHeader>
          <CardTitle>Expenditure Details (Annual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Faculty Salaries (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter faculty salaries"
                value={data.financial?.facultySalaries || ''}
                onChange={(e) => handleChange('facultySalaries', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Infrastructure Maintenance (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter maintenance cost"
                value={data.financial?.maintenanceCost || ''}
                onChange={(e) => handleChange('maintenanceCost', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Equipment & Software (₹)</Label>
              <Input
                type="number"
                placeholder="Enter equipment cost"
                value={data.financial?.equipmentCost || ''}
                onChange={(e) => handleChange('equipmentCost', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Utilities & Services (₹)</Label>
              <Input
                type="number"
                placeholder="Enter utilities cost"
                value={data.financial?.utilitiesCost || ''}
                onChange={(e) => handleChange('utilitiesCost', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Administrative Expenses (₹)</Label>
              <Input
                type="number"
                placeholder="Enter admin expenses"
                value={data.financial?.adminExpenses || ''}
                onChange={(e) => handleChange('adminExpenses', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Other Expenses (₹)</Label>
              <Input
                type="number"
                placeholder="Enter other expenses"
                value={data.financial?.otherExpenses || ''}
                onChange={(e) => handleChange('otherExpenses', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fixed Deposits (₹)</Label>
              <Input
                type="number"
                placeholder="Enter fixed deposits"
                value={data.financial?.fixedDeposits || ''}
                onChange={(e) => handleChange('fixedDeposits', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Balance (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter bank balance"
                value={data.financial?.bankBalance || ''}
                onChange={(e) => handleChange('bankBalance', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Property Value (₹)</Label>
              <Input
                type="number"
                placeholder="Enter property value"
                value={data.financial?.propertyValue || ''}
                onChange={(e) => handleChange('propertyValue', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Outstanding Loans (₹)</Label>
              <Input
                type="number"
                placeholder="Enter outstanding loans"
                value={data.financial?.outstandingLoans || ''}
                onChange={(e) => handleChange('outstandingLoans', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Financial Sustainability Plan</Label>
            <Textarea
              placeholder="Describe your financial sustainability plan"
              value={data.financial?.sustainabilityPlan || ''}
              onChange={(e) => handleChange('sustainabilityPlan', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auditor Details */}
      <Card>
        <CardHeader>
          <CardTitle>Auditor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auditor Firm Name *</Label>
              <Input
                placeholder="Enter auditor firm name"
                value={data.financial?.auditorFirm || ''}
                onChange={(e) => handleChange('auditorFirm', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Auditor Registration Number *</Label>
              <Input
                placeholder="Enter registration number"
                value={data.financial?.auditorRegNumber || ''}
                onChange={(e) => handleChange('auditorRegNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Last Audit Date</Label>
              <Input
                type="date"
                value={data.financial?.lastAuditDate || ''}
                onChange={(e) => handleChange('lastAuditDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Audit Report Status</Label>
              <Input
                placeholder="Enter audit report status"
                value={data.financial?.auditReportStatus || ''}
                onChange={(e) => handleChange('auditReportStatus', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}