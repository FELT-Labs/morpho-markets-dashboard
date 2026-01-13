/**
 * Category tabs orchestrator component - simplified and delegating to tab components
 */

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Market } from "@/types"
import { 
  Shield, 
  Droplets, 
  TrendingUp, 
  Database, 
  Settings, 
  Activity 
} from "lucide-react"
import { SafetyTab } from "./tabs/safety-tab"
import { LiquidityTab } from "./tabs/liquidity-tab"
import { YieldTab } from "./tabs/yield-tab"
import { OracleTab } from "./tabs/oracle-tab"
import { ConfigTab } from "./tabs/config-tab"
import { ActivityTab } from "./tabs/activity-tab"

interface CategoryTabsProps {
  market: Market
}

export function CategoryTabs({ market }: CategoryTabsProps) {
  return (
    <Tabs defaultValue="safety" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="safety" className="gap-1">
          <Shield className="h-3 w-3" />
          Safety
        </TabsTrigger>
        <TabsTrigger value="liquidity" className="gap-1">
          <Droplets className="h-3 w-3" />
          Liquidity
        </TabsTrigger>
        <TabsTrigger value="yield" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Yield
        </TabsTrigger>
        <TabsTrigger value="oracle" className="gap-1">
          <Database className="h-3 w-3" />
          Oracle
        </TabsTrigger>
        <TabsTrigger value="config" className="gap-1">
          <Settings className="h-3 w-3" />
          Config
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-1">
          <Activity className="h-3 w-3" />
          Activity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="safety" className="mt-6">
        <SafetyTab market={market} />
      </TabsContent>

      <TabsContent value="liquidity" className="mt-6">
        <LiquidityTab market={market} />
      </TabsContent>

      <TabsContent value="yield" className="mt-6">
        <YieldTab market={market} />
      </TabsContent>

      <TabsContent value="oracle" className="mt-6">
        <OracleTab market={market} />
      </TabsContent>

      <TabsContent value="config" className="mt-6">
        <ConfigTab market={market} />
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <ActivityTab market={market} />
      </TabsContent>
    </Tabs>
  )
}
