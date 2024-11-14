import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";
import { Repository } from "typeorm";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async get() {
    return await this.tenantRepository.find();
  }

  async getOne(id: number) {
    return await this.tenantRepository.findOneBy({ id });
  }

  async update(id: number, tenantData: ITenant) {
    return await this.tenantRepository.update(id, tenantData);
  }

  async delete(id: number) {
    return await this.tenantRepository.delete(id);
  }
}
