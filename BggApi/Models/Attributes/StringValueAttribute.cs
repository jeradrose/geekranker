using System.Xml;
using System.Xml.Serialization;

namespace BggApi.Models.Attributes;

public class StringValueAttribute {
    [XmlAttribute("value")]
    public string Value { get; set; }
}
