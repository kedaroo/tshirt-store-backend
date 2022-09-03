// base - Product.find()
// bigQ = ...

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchWord = this.bigQ.search
      ? {
          name: { $regex: this.bigQ.search, $option: "i" },
        }
      : {};

    this.base = this.base.find(...searchWord);
    // this.base = Product.find().find(...searchWord);

    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    // remove unneccasary fields
    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    // convert bigQ into a string => copyQ
    let stringCopyQ = JSON.stringify(copyQ);
    stringCopyQ = stringCopyQ.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (match) => `$${match}`
    );

    let jsonCopyQ = JSON.parse(stringCopyQ);

    this.base = this.base.find(jsonCopyQ);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    const skipVal = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;
