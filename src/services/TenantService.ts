import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";
import { Repository } from "typeorm";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }
}
