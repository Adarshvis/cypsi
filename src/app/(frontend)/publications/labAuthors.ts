/**
 * Lab authors offered in the publications Author filter.
 *
 * TEMPORARY: hardcoded until the filter options move into the CMS. Each entry
 * is one person; `aliases` are the other spellings that appear on publications,
 * so all of them count towards the same filter entry. Matching ignores case,
 * accents, dots and spaces ("M.K. Das" = "M. K. Das" = "mk das").
 *
 * Authors ticked "Is Lab Member?" on a publication but missing here still get
 * their own entry, so a new member shows up without a code change.
 */
export interface LabAuthor {
  name: string
  aliases?: string[]
}

export const LAB_AUTHORS: LabAuthor[] = [
  { name: 'Akhilesh Kumar Tyagi' },
  { name: 'Abhirup Nandy' },
  { name: 'Akshat Gaurav' },
  { name: 'Amit Birwal' },
  { name: 'Amit Pundir' },
  { name: 'Anil Singh Bafila', aliases: ['Anil S. Bafila', 'Anil Bafila'] },
  { name: 'Ashish Bhushan' },
  { name: 'Ashutosh Mani Tripathi' },
  { name: 'Ankita Prusty' },
  { name: 'Binod Kumar Kanaujia' },
  { name: 'Brij B. Gupta' },
  { name: 'Dharmendra Kumar Mahato' },
  { name: 'Diptadeep Bhattacharjee' },
  { name: 'Divya Karwal' },
  { name: 'Geetika Jain Saxena', aliases: ['Geetika J. Saxena', 'Geetika Saxena'] },
  { name: 'Harshita Sharma' },
  { name: 'Ishita Pundir' },
  { name: 'Karanpreet Singh' },
  { name: 'Kunal Sharma' },
  { name: 'Manish Kumar' },
  { name: 'Mrinal K. Das', aliases: ['M.K. Das'] },
  { name: 'Mosiur Rahaman' },
  { name: 'Neha Sinha' },
  { name: 'Nitisha Aggarwal' },
  { name: 'Osamah Mohammed Jasim', aliases: ['Osamah Jasim'] },
  { name: 'Pahalage Dona Thushari' },
  { name: 'Pratibha Dohare' },
  { name: 'Priyanka Deveshwar' },
  { name: 'Pushkar Baranwal' },
  { name: 'Rahul Chawla' },
  { name: 'Rajat Budhiraja' },
  { name: 'Sajad Majeed Zargar' },
  { name: 'Sachin Kumar' },
  { name: 'Sanchit Gandhi' },
  { name: 'Sanjeev Singh' },
  { name: 'Shivam Sharma' },
  { name: 'Sumukh Gupta' },
  { name: 'Sushant Jain' },
  { name: 'Sunil Kumar' },
  { name: 'Tapasya Srivastava' },
  { name: 'Unmesh Shukla' },
  { name: 'Vajratiya Vajrobol' },
  { name: 'Vishal Parashar' },
]

/** Comparison key: lowercase letters only, accents stripped. */
export function authorKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

const CANONICAL_BY_KEY = new Map<string, string>()
for (const author of LAB_AUTHORS) {
  for (const spelling of [author.name, ...(author.aliases || [])]) {
    CANONICAL_BY_KEY.set(authorKey(spelling), author.name)
  }
}

/**
 * The lab authors of one publication, by display name, in author order and
 * without duplicates. Listed names win; a ticked "Is Lab Member?" name that is
 * not listed is kept as typed.
 */
export function labAuthorsOf(authors: { name: string; isLabMember?: boolean | null }[]): string[] {
  const found: string[] = []
  for (const author of authors) {
    const name = author.name?.trim()
    if (!name) continue
    const canonical = CANONICAL_BY_KEY.get(authorKey(name)) || (author.isLabMember ? name : null)
    if (canonical && !found.includes(canonical)) found.push(canonical)
  }
  return found
}

/** URL-safe id for `?author=`, e.g. "geetika-jain-saxena". */
export function authorSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
