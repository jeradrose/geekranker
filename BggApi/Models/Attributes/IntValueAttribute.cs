using System.Xml;
using System.Xml.Serialization;

namespace BggApi.Models.Attributes;

public class IntValueAttribute {
    [XmlAttribute("value")]
    public int Value { get; set; }
}
