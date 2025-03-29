import { Company } from 'src/_entities';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export function handleCompanyAddress(this: CrawlerService, company: Company) {
  const address = company.address || '';

  if (!address) {
    console.warn(`Company ${company.id} has an empty address.`);
    return;
  }

  // Use the regex patterns
  const addressParts = address.split(',').map((part) => part.trim());

  const provincePart = addressParts[addressParts.length - 1] || '';
  const districtPart = addressParts[addressParts.length - 2] || '';
  const wardPart = addressParts[addressParts.length - 3] || '';

  // Regex patterns
  const provinceRegex = /(?:Tỉnh|Thành phố|TP)?\s*(.+)/i;
  const districtRegex = /(?:Quận|Huyện|Thị xã|Thành phố|TP)?\s*(.+)/i;
  const wardRegex = /(?:Phường|Xã|Thị trấn)?\s*(.+)/i;

  // Extract names
  const provinceMatch = provincePart.match(provinceRegex);
  const districtMatch = districtPart.match(districtRegex);
  const wardMatch = wardPart.match(wardRegex);

  const provinceName = provinceMatch ? provinceMatch[1].trim() : provincePart;
  const districtName = districtMatch ? districtMatch[1].trim() : districtPart;
  const wardName = wardMatch ? wardMatch[1].trim() : wardPart;

  console.log(`${wardName} - ${districtName} - ${provinceName}`);

  if (provinceName) {
    const province = this.provinces.find((p) =>
      vietnameseSlugify(provinceName.toLowerCase()).includes(
        p.slug.replace(/(tinh|thanh-pho)\-/, ''),
      ),
    );
    if (province) {
      company.provinceId = province.id;
    }
  }

  if (districtName) {
    const district = this.districts.find((d) =>
      vietnameseSlugify(districtName.toLowerCase()).includes(
        d.slug.replace(/(quan|huyen|thi\-xa)\-/, ''),
      ),
    );
    if (district) {
      company.districtId = district.id;
    }
  }

  if (wardName) {
    const ward = this.wards.find((w) =>
      vietnameseSlugify(wardName.toLowerCase()).includes(
        w.slug.replace(/(xa|phuong|thi\-tran)\-/, ''),
      ),
    );
    if (ward) {
      company.wardId = ward.id;
    }
  }

  return company;
}
